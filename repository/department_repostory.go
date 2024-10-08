package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

type departmentRepository struct {
	ctx            context.Context
	deptCollection *mongo.Collection
}

func NewDepartmentRepository(ctx context.Context, deptCollection *mongo.Collection) DepartmentRepository {
	return &departmentRepository{
		ctx:            ctx,
		deptCollection: deptCollection,
	}
}

func (r *departmentRepository) Create(impl *DepartmentImpl) (*DepartmentDB, error) {

	departmentImpl := DepartmentImpl{}
	err := r.deptCollection.FindOne(r.ctx, bson.M{"code": impl.Code}).Decode(&departmentImpl)
	if err == nil {
		return nil, errors.New("duplicate key error. The code department already exists")
	}
	err = r.deptCollection.FindOne(r.ctx, bson.M{"title": impl.Title}).Decode(&departmentImpl)
	if err == nil {
		return nil, errors.New("duplicate key error. The title department already exists")
	}

	if !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}

	curr, err := r.deptCollection.InsertOne(r.ctx, impl)
	if err != nil {
		var er mongo.WriteException
		if errors.As(err, &er) && er.WriteErrors[0].Code == 11000 {
			return nil, errors.New("duplicate key error. The department already exists")
		}
		return nil, err
	}

	// set Index
	opt := options.Index()
	opt.SetUnique(true)
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "title", Value: 1}, {Key: "code", Value: 1}},
		Options: opt,
	}

	if _, err := r.deptCollection.Indexes().CreateOne(r.ctx, indexModel); err != nil {
		return nil, err
	}

	// get a new department info
	//department := DepartmentImpl{}
	department := DepartmentDB{}

	if ok := r.deptCollection.FindOne(r.ctx, bson.M{"_id": curr.InsertedID}).Decode(&department); ok != nil {
		return nil, ok
	}

	return &department, nil

}
func (r *departmentRepository) Update(impl *DepartmentImpl) (*DepartmentImpl, error) {

	id, err := primitive.ObjectIDFromHex(impl.Id)
	if err != nil || id.IsZero() || impl.Id == "" {
		return nil, errors.New(
			"invalid department id")
	}

	existing := DepartmentImpl{}
	err = r.deptCollection.FindOne(r.ctx, bson.M{"code": impl.Code}).Decode(&existing)
	if err == nil {
		return nil, errors.New("duplicate key error. The code department already exists")
	}

	filter := bson.D{{"_id", id}}

	updateFields := bson.D{}
	if impl.Title != "" {
		updateFields = append(updateFields, bson.E{Key: "title", Value: impl.Title})
	}
	if impl.Code != "" {
		updateFields = append(updateFields, bson.E{Key: "code", Value: impl.Code})
	}
	//query := bson.D{{"$set", updateFields}
	query := bson.D{{Key: "$set", Value: updateFields}}
	res, err := r.deptCollection.UpdateOne(r.ctx, filter, query)
	if err != nil {
		return nil, err
	}

	log.Printf("Matched %d documents for update with ID %s", res.MatchedCount, impl.Id)

	return impl, nil

}
func (r *departmentRepository) Delete(id string) error {
	if id == "" {
		return errors.New("invalid department id")
	}
	delResult, err := r.deptCollection.DeleteOne(r.ctx, bson.M{"_id": id})
	if err != nil {
	}
	if delResult == nil {
		return err
	}
	if delResult.DeletedCount == 0 {
		return errors.New("department not found")
	}
	return nil
}
func (r *departmentRepository) DepartmentsByCode(code string) (*DepartmentImpl, error) {
	if code == "" {
		return nil, errors.New("invalid department code")
	}
	departmentResult := r.deptCollection.FindOne(r.ctx, bson.M{"code": code})
	if departmentResult.Err() != nil {
		return nil, departmentResult.Err()
	}
	department := DepartmentImpl{}
	if err := departmentResult.Decode(&department); err != nil {
		return nil, err
	}
	return &department, nil
}
func (r *departmentRepository) DepartmentsList(filter Filter) ([]*DepartmentDB, error) {
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
	skip := (int64(filter.Page) - 1) * limit

	// Handler sorting
	sortOrder := 1
	if filter.Sort == "desc" {
		sortOrder = -1
	}
	sort := bson.D{{"title", sortOrder}, {"code", sortOrder}}
	// Create query filter
	query := bson.D{}
	if filter.Keyword != "" {
		keywordFilter := bson.D{{Key: "$regex", Value: filter.Keyword}, {"$options", "i"}}
		query = bson.D{{"$or", bson.A{
			bson.D{{Key: "title", Value: keywordFilter}},
			bson.D{{Key: "code", Value: keywordFilter}},
		}}}
	}
	//opts := options.FindOptions{Limit: &limit, Skip: &skip, Sort: sort}
	opts := options.Find().SetLimit(limit).SetSkip(skip).SetSort(sort)
	curr, err := r.deptCollection.Find(r.ctx, query, opts)
	if err != nil {
		return nil, err
	}
	// Close cursor when done
	defer func(curr *mongo.Cursor, ctx context.Context) {
		err := curr.Close(ctx)
		if err != nil {

		}
	}(curr, r.ctx)

	//departments := []*DepartmentDB{}
	departments := make([]*DepartmentDB, 0)
	for curr.Next(r.ctx) {
		department := DepartmentDB{}
		if err := curr.Decode(&department); err != nil {
			return nil, err
		}
		departments = append(departments, &department)
	}
	if err := curr.Err(); err != nil {
		return nil, err
	}

	return departments, nil
}
