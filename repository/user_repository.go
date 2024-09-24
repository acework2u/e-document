package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type userRepository struct {
	ctx            context.Context
	userCollection *mongo.Collection
}

func NewUserRepository(ctx context.Context, userCollection *mongo.Collection) UserRepository {
	return &userRepository{
		ctx:            ctx,
		userCollection: userCollection,
	}
}
func (r *userRepository) UserCreate(user UserRepositoryImpl) (*UserRepositoryDB, error) {
	userDuplicate := UserRepositoryDB{}
	err := r.userCollection.FindOne(r.ctx, bson.M{"email": user.Email}).Decode(&userDuplicate)
	if err == nil {
		return nil, errors.New("user already exists")
	}
	filter := bson.D{{"$regex", user.Name}, {"$options", "i"}}
	query := bson.D{{"$or", bson.A{
		bson.D{{"name", filter}},
		bson.D{{"lastname", filter}},
	}}}
	err = r.userCollection.FindOne(r.ctx, query).Decode(&userDuplicate)
	if err == nil {
		return nil, errors.New("user already exists")
	}

	// Crate a new user
	result, err := r.userCollection.InsertOne(r.ctx, user)
	if err != nil {
		var er mongo.WriteException
		if errors.As(err, &er) && er.WriteErrors[0].Code == 11000 {
			return nil, errors.New("user already exists")
		}
		return nil, err
	}
	if result.InsertedID == nil {
		return nil, errors.New("user not created")
	}
	// Set Index
	opt := options.Index().SetUnique(true)
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{"email", 1}, {"name", 1}, {"lastname", 1}},
		Options: opt,
	}
	if _, err := r.userCollection.Indexes().CreateOne(r.ctx, indexModel); err != nil {
		return nil, err
	}
	// Get a new user
	userInserted := UserRepositoryDB{}
	if err := r.userCollection.FindOne(r.ctx, bson.M{"_id": result.InsertedID}).Decode(&userInserted); err != nil {
		return nil, err
	}

	return &userInserted, nil
}
func (r *userRepository) UserUpdate(uId string, user UserRepositoryImpl) error {
	userId, err := primitive.ObjectIDFromHex(uId)
	if err != nil || userId == primitive.NilObjectID || uId == "" {
		return errors.New("user not found")
	}
	existUser := UserRepositoryDB{}

	err = r.userCollection.FindOne(r.ctx, bson.M{"name": user.Name}).Decode(&existUser)
	if err == nil {
		return errors.New("user already exists")
	}
	err = r.userCollection.FindOne(r.ctx, bson.M{"email": user.Lastname}).Decode(&existUser)
	if err == nil {
		return errors.New("user already exists")
	}

	filter := bson.D{{"_id", userId}}
	updateFields := bson.D{}
	if user.Name != "" {
		updateFields = append(updateFields, bson.E{Key: "name", Value: user.Name})
	}
	if user.Lastname != "" {
		updateFields = append(updateFields, bson.E{Key: "lastname", Value: user.Lastname})
	}
	if user.Email != "" {
		updateFields = append(updateFields, bson.E{Key: "email", Value: user.Email})
	}
	if user.Status != 0 {
		updateFields = append(updateFields, bson.E{Key: "status", Value: user.Status})
	}
	if user.Department != "" {
		updateFields = append(updateFields, bson.E{Key: "department", Value: user.Department})
	}
	if len(user.Acl) != 0 {
		updateFields = append(updateFields, bson.E{Key: "acl", Value: user.Acl})
	}
	if len(updateFields) == 0 {
		return errors.New("user not updated")
	}
	_, err = r.userCollection.UpdateOne(r.ctx, filter, bson.D{{"$set", updateFields}})
	if err != nil {
		return err
	}

	return nil
}
func (r *userRepository) UserDelete(userId string) error {
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil || id == primitive.NilObjectID {
		return errors.New("user not found")
	}
	delResult, err := r.userCollection.DeleteOne(r.ctx, bson.M{"_id": id})
	if err != nil {
		return errors.New("user not deleted")
	}
	if delResult.DeletedCount == 0 {
		return errors.New("user not deleted")
	}
	return nil
}
func (r *userRepository) UserList(filter Filter) ([]*UserRepositoryImpl, error) {
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Sort != "asc" && filter.Sort != "desc" {
		filter.Sort = "asc"
	}
	limit := int64(filter.Limit)
	skip := int64((filter.Page - 1) * filter.Limit)
	sortOrder := 1
	if filter.Sort == "desc" {
		sortOrder = -1
	}
	sort := bson.D{{"name", sortOrder}}
	query := bson.D{}
	if filter.Keyword != "" {
		keywordFilter := bson.D{{"$regex", filter.Keyword}, {"$options", "i"}}
		query = bson.D{{"$or", bson.A{
			bson.D{{"name", keywordFilter}},
			bson.D{{"lastname", keywordFilter}},
			bson.D{{"email", keywordFilter}},
		}}}
	}
	opts := options.Find().SetSort(sort).SetLimit(limit).SetSkip(skip)
	cursor, err := r.userCollection.Find(r.ctx, query, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(r.ctx)

	var users []*UserRepositoryImpl
	if err := cursor.All(r.ctx, &users); err != nil {
		return nil, err
	}
	return users, nil
}
func (r *userRepository) UserView(userId string) (*UserRepositoryDB, error) {
	if userId == "" {
		return nil, errors.New("user not found")
	}

	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil || id == primitive.NilObjectID {
		return nil, errors.New("user not found")
	}

	userResponse := r.userCollection.FindOne(r.ctx, bson.M{"_id": id})
	if userResponse.Err() != nil {
		return nil, userResponse.Err()
	}
	if userResponse == nil {
		return nil, errors.New("user not found")
	}
	user := UserRepositoryDB{}
	err = userResponse.Decode(&user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
func (r *userRepository) SetPassword(userId string, password string) error {
	if userId == "" {
		return errors.New("user not found")
	}
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil || id == primitive.NilObjectID {
		return errors.New("user not found")
	}
	filter := bson.D{{"_id", id}}
	updateFields := bson.D{{"$set", bson.D{{"password", password}}}}
	result, err := r.userCollection.UpdateOne(r.ctx, filter, updateFields)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("user not found")
	}
	return nil
}
func (r *userRepository) SetAcl(userId string, acl []int) error {
	if userId == "" {
		return errors.New("user not found")
	}
	if len(acl) == 0 {
		return errors.New("user not found")
	}
	if len(acl) > 3 {
		return errors.New("acl max 3")
	}
	id, err := primitive.ObjectIDFromHex(userId)
	if err != nil || id == primitive.NilObjectID {
		return errors.New("user not found")
	}
	filter := bson.D{{"_id", id}}
	updateFields := bson.D{{"$set", bson.D{{"acl", acl}}}}
	result, err := r.userCollection.UpdateOne(r.ctx, filter, updateFields)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("user not found")
	}

	return nil
}
func (r *userRepository) UserSignIn(user *UserAuthenticationImpl) (*UserRepositoryDB, error) {
	if user.Username == "" || user.Password == "" {
		return nil, errors.New("user not found")
	}
	filter := bson.D{{"username", user.Username}}
	opt := options.FindOne().SetProjection(bson.D{{"password", 1}, {"acl", 1}, {"department", 1}})
	userResponse := r.userCollection.FindOne(r.ctx, filter, opt)
	if userResponse.Err() != nil {
		return nil, userResponse.Err()
	}
	if userResponse == nil {
		return nil, errors.New("user not found")
	}
	userRes := UserRepositoryDB{}
	err := userResponse.Decode(&userRes)
	if err != nil {
		return nil, err
	}

	return &userRes, nil
}
