package repository

import "go.mongodb.org/mongo-driver/bson/primitive"

type DepartmentRepository interface {
	Create(impl *DepartmentImpl) (*DepartmentImpl, error)
	Update(impl *DepartmentImpl) (*DepartmentImpl, error)
	Delete(id string) error
	DepartmentsByCode(code string) (*DepartmentImpl, error)
	DepartmentsList() ([]*DepartmentImpl, error)
}

type DepartmentImpl struct {
	DepCode string `bson:"depId"`
	Title   string `bson:"title"`
}
type Department struct {
	Id      primitive.ObjectID `bson:"_id,omitempty"`
	DepCode string             `json:"depId"`
	Title   string             `json:"title"`
}
