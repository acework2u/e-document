package services

import (
	"errors"
	"github.com/acework2u/e-document/repository"
	"log"
	"strings"
)

type departmentService struct {
	deptRepo repository.DepartmentRepository
}

func NewDepartmentService(deptRepo repository.DepartmentRepository) DepartmentService {
	return &departmentService{deptRepo: deptRepo}
}
func (s *departmentService) CreateDepartment(impl *Department) (*Department, error) {

	if impl.Code == "" {
		return nil, errors.New(
			"department code is required")
	}
	if impl.Title == "" {
		return nil, errors.New(
			"department title is required")
	}

	impl.Code = strings.ToUpper(impl.Code)

	result, err := s.deptRepo.Create(&repository.DepartmentImpl{
		Code:  strings.ToLower(impl.Code),
		Title: impl.Title,
	})
	if err != nil {
		return nil, err
	}
	return &Department{
		Id:    result.Id.Hex(),
		Code:  strings.ToUpper(result.Code),
		Title: result.Title,
	}, nil
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
		}
		departments = append(departments, department)
	}

	log.Println("department : ", departments)

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
		Code:  strings.ToLower(impl.Code),
		Title: impl.Title,
	})
	if err != nil {
		return errors.New(
			"department not found")
	}

	return nil

}
