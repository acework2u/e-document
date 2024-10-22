package services

import (
	"errors"
	"github.com/acework2u/e-document/repository"
	"strings"
)

type departmentService struct {
	deptRepo repository.DepartmentRepository
}

func NewDepartmentService(deptRepo repository.DepartmentRepository) DepartmentService {
	return &departmentService{deptRepo: deptRepo}
}
func (s *departmentService) CreateDepartment(impl *Department) (Department, error) {

	department := Department{}

	if impl == nil {
		return department, errors.New("department data is required")
	}
	if impl.Code == "" {
		return department, errors.New("department code is required")
	}
	if impl.Title == "" {
		return department, errors.New("department title is required")
	}

	impl.Code = strings.ToUpper(impl.Code)
	result, err := s.deptRepo.Create(&repository.DepartmentImpl{
		Code:  impl.Code, // No need to convert again
		Title: impl.Title,
		Group: impl.Group,
	})
	if err != nil {
		return department, err
	}

	department = Department{
		Id:    result.Id.Hex(),
		Code:  result.Code,
		Title: result.Title,
	}

	return department, nil
}
func (s *departmentService) GetDepartments(filter Filter) ([]*Department, error) {

	if filter.Limit < filter.Page && filter.Page > 0 {
		filter.Page = filter.Limit
	}

	res, err := s.deptRepo.DepartmentsList(repository.Filter{
		Page:    filter.Page,
		Limit:   filter.Limit,
		Sort:    filter.Sort,
		Keyword: filter.Keyword,
	})
	if err != nil {
		return nil, err
	}

	departments := make([]*Department, 0, len(res))

	for _, item := range res {
		department := &Department{
			Id:    item.Id.Hex(),
			Code:  strings.ToUpper(item.Code),
			Title: item.Title,
			Group: item.Group,
		}
		departments = append(departments, department)
	}

	return departments, nil
}
func (s *departmentService) UpdateDepartment(impl *Department) error {

	if impl.Id == "" {
		return errors.New(
			"department id is required")
	}
	if impl.Code == "" {
		return errors.New(
			"department code is required")
	}
	if impl.Title == "" {
		return errors.New(
			"department title is required")
	}

	_, err := s.deptRepo.Update(&repository.DepartmentImpl{
		Id:    impl.Id,
		Code:  strings.ToUpper(impl.Code),
		Title: impl.Title,
		Group: impl.Group,
	})
	if err != nil {
		return errors.New(
			"department not found")
	}

	return nil

}
func (s *departmentService) DeleteDepartment(id string) error {
	if id == "" {
		return errors.New(
			"department id is required")
	}
	err := s.deptRepo.Delete(id)
	if err != nil {
		return errors.New(
			"department not found")
	}
	return nil
}
func (s *departmentService) GetDepartmentById(id string) (*Department, error) {

	if id == "" {
		return nil, errors.New(
			"department id is required")
	}
	result, err := s.deptRepo.DepartmentsById(id)
	if err != nil {
		return nil, errors.New(
			"department not found")
	}
	if result == nil {
		return nil, errors.New(
			"department not found")
	}
	department := &Department{
		Id:    result.Id.Hex(),
		Code:  result.Code,
		Title: result.Title,
		Group: result.Group,
	}

	return department, nil
}
