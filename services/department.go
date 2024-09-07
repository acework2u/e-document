package services

type DepartmentService interface {
	GetDepartments(filter Filter) ([]*Department, error)
	CreateDepartment(impl *Department) (*Department, error)
	UpdateDepartment(impl *Department) error
}

type Department struct {
	Id    string `json:"id"`
	Code  string `json:"code" validate:"required,min=2,max=3"`
	Title string `json:"title" validate:"required,min=3,max=255"`
}
type Filter struct {
	Page    int    `json:"page"`
	Limit   int    `json:"limit"`
	Sort    string `json:"sort"`
	Keyword string `json:"keyword"`
}
