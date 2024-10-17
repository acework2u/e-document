package services_test

import (
	"errors"
	"github.com/acework2u/e-document/repository"
	"github.com/acework2u/e-document/services"
	"github.com/stretchr/testify/mock"
	"testing"

	"github.com/stretchr/testify/assert"
)

type MockDepartmentRepository struct {
	mock.Mock `json:"mock.Mock"`
}

func (m *MockDepartmentRepository) Create(impl *repository.DepartmentImpl) (*repository.DepartmentDB, error) {
	args := m.Called(impl)
	if mockRet, ok := args.Get(0).(*repository.DepartmentDB); ok {
		return mockRet, args.Error(1)
	}
	return nil, args.Error(1)
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
	if mockRet, ok := args.Get(0).(error); ok {
		return mockRet
	}
	return nil
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

func TestCreateDepartment(t *testing.T) {
	mockRepo := new(MockDepartmentRepository)
	srv := services.NewDepartmentService(mockRepo)

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
				Code:  "test",
				Title: "Test",
			},
		},
		{
			name:    "Return Error from Repo",
			dept:    &services.Department{Code: "TSTC", Title: "Test"},
			mockErr: errors.New("error"),
			wantErr: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			//mockRepo.reset()
			mockRepo.On("Create", &repository.DepartmentImpl{
				Code:  test.dept.Code,
				Title: test.dept.Title,
			}).Return(nil, test.mockErr)

			_, err := srv.CreateDepartment(test.dept)
			assert.Equal(t, test.wantErr, err != nil)

			for _, test := range tests {
				t.Run(test.name, func(t *testing.T) {
					// mockRepo.reset() // Ensure you reset mocks if persistent

					mockRepo.On("Create", &repository.DepartmentImpl{
						Code:  test.dept.Code,
						Title: test.dept.Title,
					}).Return(nil, test.mockErr)

					_, err := srv.CreateDepartment(test.dept)
					assert.Equal(t, test.wantErr, err != nil)

					if !test.wantErr {
						if assert.NotNil(t, test.mockRet, "mockRet should not be nil") {
							assert.Equal(t,
								&services.Department{
									Id:    test.mockRet.Id,
									Code:  test.mockRet.Code,
									Title: test.mockRet.Title,
								}, test.mockRet, "Department object should match the expected one",
							)
						}
					}
				})
			}
			assert.Contains(t, test.dept.Code, "TSTC")
		})
	}
}
