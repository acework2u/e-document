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
	Limit   int    `form:"limit" json:"limit" uri:"limit"`
	Page    int    `form:"page" json:"page" uri:"page"`
	Sort    string `form:"sort" json:"sort" uri:"sort"`
	Keyword string `form:"keyword" json:"keyword" uri:"keyword"`
}
