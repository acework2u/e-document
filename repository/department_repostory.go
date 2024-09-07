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

	existings := DepartmentImpl{}
	//filter := bson.D{{Key: "title", Value: impl.Title}, {Key: "code", Value: impl.Code}}
	//err := r.deptCollection.FindOne(r.ctx, filter).Decode(&existings)
	//
	//if err == nil {
	//	return nil, errors.New("Duplicate key error. The department already exists.")
	//}
	//
	//if err != mongo.ErrNoDocuments {
	//	return nil, err
	//}
	err := r.deptCollection.FindOne(r.ctx, bson.M{"code": impl.Code}).Decode(&existings)
	if err == nil {
		return nil, errors.New("Duplicate key error. The code department already exists.")
	}
	err = r.deptCollection.FindOne(r.ctx, bson.M{"title": impl.Title}).Decode(&existings)
	if err == nil {
		return nil, errors.New("Duplicate key error. The title department already exists.")
	}

	if err != mongo.ErrNoDocuments {
		return nil, err
	}

	curr, err := r.deptCollection.InsertOne(r.ctx, impl)
	if err != nil {
		if er, ok := err.(mongo.WriteException); ok && er.WriteErrors[0].Code == 11000 {
			return nil, errors.New(
				"Duplicate key error. The department already exists.")
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
		return nil, errors.New("Invalid department id")
	}

	existings := DepartmentImpl{}
	err = r.deptCollection.FindOne(r.ctx, bson.M{"code": impl.Code}).Decode(&existings)
	if err == nil {
		return nil, errors.New("Duplicate key error. The code department already exists.")
	}
	//err = r.deptCollection.FindOne(r.ctx, bson.M{"title": impl.Title}).Decode(&existings)
	//if err == nil {
	//	return nil, errors.New("Duplicate key error. The title department already exists.")
	//}
	//
	//if err != mongo.ErrNoDocuments {
	//	return nil, err
	//}

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
	return nil
}
func (r *departmentRepository) DepartmentsByCode(code string) (*DepartmentImpl, error) {
	return nil, nil
}
func (r *departmentRepository) DepartmentsList(filter Filter) ([]*DepartmentDB, error) {

	limit := int64(filter.Limit)
	skip := int64(filter.Page)*limit - limit
	sort := bson.D{{}}
	sort = bson.D{{Key: "title", Value: 1}}
	if len(filter.Sort) > 0 && filter.Sort == "asc" {
		sort = bson.D{{Key: "title", Value: -1}}
	} else {
		sort = bson.D{{Key: "title", Value: 1}}
	}

	opts := options.FindOptions{Limit: &limit, Skip: &skip, Sort: sort}
	curr, err := r.deptCollection.Find(r.ctx, bson.D{{}}, &opts)
	if err != nil {
		return nil, err
	}
	departments := []*DepartmentDB{}
	for curr.Next(r.ctx) {
		department := DepartmentDB{}
		if err := curr.Decode(&department); err != nil {
			return nil, err
		}
		departments = append(departments, &department)
	}

	return departments, nil
}
