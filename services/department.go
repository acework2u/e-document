package services

type DepartmentService interface {
	GetDepartments() ([]*Department, error)
	CreateDepartment(impl *Department) (*Department, error)
}

type Department struct {
	Code  string `json:"code" validate:"required,min=2,max=3"`
	Title string `json:"title" validate:"required,min=3,max=255"`
}
