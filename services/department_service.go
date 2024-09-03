package services

import "e-document/repository"

type departmentService struct {
	deptRepo repository.DepartmentRepository
}

func NewDepartmentService(deptRepo repository.DepartmentRepository) DepartmentService {
	return &departmentService{deptRepo: deptRepo}
}
func (s *departmentService) CreateDepartment(impl *Department) (*Department, error) {

	result, err := s.deptRepo.Create(&repository.DepartmentImpl{
		DepCode: impl.Code,
		Title:   impl.Title,
	})
	if err != nil {
		return nil, err
	}
	return &Department{
		Code:  result.DepCode,
		Title: result.Title,
	}, nil
}
func (s *departmentService) GetDepartments() ([]*Department, error) {

	res, err := s.deptRepo.DepartmentsList()
	if err != nil {
		return nil, err
	}

	departments := make([]*Department, len(res))

	for _, item := range res {
		department := &Department{
			Code:  item.DepCode,
			Title: item.Title,
		}
		departments = append(departments, department)
	}

	return departments, nil
}
