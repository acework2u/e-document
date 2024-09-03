package repository

import (
	"context"
	"errors"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

func (r *departmentRepository) Create(impl *DepartmentImpl) (*DepartmentImpl, error) {
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
	department := DepartmentImpl{}

	if ok := r.deptCollection.FindOne(r.ctx, bson.M{"_id": curr.InsertedID}).Decode(&department); ok != nil {
		return nil, ok
	}

	result := curr.InsertedID

	fmt.Println("In departmentRepository, Create, result:", result)
	fmt.Println(result)

	return &department, nil

}
func (r *departmentRepository) Update(impl *DepartmentImpl) (*DepartmentImpl, error) {
	return nil, nil
}
func (r *departmentRepository) Delete(id string) error {
	return nil
}
func (r *departmentRepository) DepartmentsByCode(code string) (*DepartmentImpl, error) {
	return nil, nil
}
func (r *departmentRepository) DepartmentsList() ([]*DepartmentImpl, error) {
	return nil, nil
}
