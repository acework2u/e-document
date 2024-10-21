package services_test

import (
	"errors"
	"github.com/acework2u/e-document/repository"
	"github.com/acework2u/e-document/services"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"log"
	"testing"
)

type MockDepartmentRepository struct {
	mock.Mock
}

func NewMockDepartmentRepository() *MockDepartmentRepository {
	return &MockDepartmentRepository{}
}

func (m *MockDepartmentRepository) Create(impl *repository.DepartmentImpl) (repository.DepartmentDB, error) {
	args := m.Called(impl)
	if mockRet, ok := args.Get(0).(repository.DepartmentDB); ok {
		return mockRet, args.Error(1)
	}
	return repository.DepartmentDB{}, args.Error(1)
}

func (m *MockDepartmentRepository) Update(impl *repository.DepartmentImpl) (*repository.DepartmentImpl, error) {
	args := m.Called(impl)
	if mockRet, ok := args.Get(0).(*repository.DepartmentImpl); ok {
		return mockRet, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockDepartmentRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockDepartmentRepository) DepartmentsByCode(id string) (*repository.DepartmentImpl, error) {
	args := m.Called(id)
	if mockRet, ok := args.Get(0).(*repository.DepartmentImpl); ok {
		return mockRet, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockDepartmentRepository) DepartmentsList(filter repository.Filter) ([]*repository.DepartmentDB, error) {
	args := m.Called(filter)
	if mockRet, ok := args.Get(0).([]*repository.DepartmentDB); ok {
		return mockRet, args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockDepartmentRepository) DepartmentsById(id string) (*repository.DepartmentDB, error) {
	args := m.Called(id)
	if mockRet, ok := args.Get(0).(*repository.DepartmentDB); ok {
		return mockRet, args.Error(1)
	}
	return nil, args.Error(1)
}

func TestCreateDepartment(t *testing.T) {
	mockRepo := &MockDepartmentRepository{}
	srv := services.NewDepartmentService(mockRepo)
	_ = srv
	tests := []struct {
		name    string
		dept    *services.Department
		mockRet *repository.DepartmentImpl
		mockErr error
		wantErr bool
	}{
		{
			name:    "Empty Code",
			dept:    &services.Department{Title: "Test"},
			wantErr: true,
		},
		{
			name:    "Empty Title",
			dept:    &services.Department{Code: "TSTC"},
			wantErr: true,
		},
		{
			name: "Valid Department",
			dept: &services.Department{Code: "TSTC", Title: "Test"},
			mockRet: &repository.DepartmentImpl{
				Id:    "12345",
				Code:  "TSTC",
				Title: "Test",
			},
			mockErr: nil,
		},
		{
			name:    "Return Error from Repo",
			dept:    &services.Department{Code: "TSTM", Title: "Test"},
			mockErr: errors.New("error"),
			wantErr: true,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockRepo.On("Create", &repository.DepartmentImpl{
				Code:  test.dept.Code,
				Title: test.dept.Title,
			}).Return(test.mockRet, test.mockErr)

			log.Printf("running test: %v", test.mockRet)

			got, err := srv.CreateDepartment(test.dept)
			log.Printf("got: %v, err: %v", got, err)
			if test.wantErr {
				assert.Error(t, err)
			}
			if test.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				if test.mockRet != nil {
					expected := services.Department{
						Id:    test.mockRet.Id,
						Code:  test.mockRet.Code,
						Title: test.mockRet.Title,
					}
					_ = expected
					//assert.Equal(t, expected, got)
				}
			}

		})
	}
}
