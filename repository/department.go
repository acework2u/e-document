package repository

import "go.mongodb.org/mongo-driver/bson/primitive"

type DepartmentRepository interface {
	Create(impl *DepartmentImpl) (DepartmentDB, error)
	Update(impl *DepartmentImpl) (*DepartmentImpl, error)
	Delete(id string) error
	DepartmentsByCode(code string) (*DepartmentImpl, error)
	DepartmentsList(filter Filter) ([]*DepartmentDB, error)
	DepartmentsById(id string) (*DepartmentDB, error)
}

type Filter struct {
	Page        int      `json:"page"`
	Limit       int      `json:"limit"`
	Sort        string   `json:"sort"`
	Keyword     string   `json:"keyword"`
	Departments []string `json:"departments"`
}

type DepartmentDB struct {
	Id    primitive.ObjectID `bson:"_id,omitempty"`
	Code  string             `bson:"code"`
	Title string             `bson:"title"`
}

type DepartmentImpl struct {
	Id    string `bson:"_id,omitempty"`
	Code  string `bson:"code"`
	Title string `bson:"title"`
}
type Department struct {
	Id      primitive.ObjectID `bson:"_id,omitempty"`
	DepCode string             `json:"code"`
	Title   string             `json:"title"`
}
