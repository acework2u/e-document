package main_test

import (
	"fmt"
	"github.com/stretchr/testify/mock"
	"testing"
)

type UserMock struct {
	mock.Mock
}

type User interface {
	Get(id string) (UserImpl, error)
}
type UserImpl struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Age  int    `json:"age"`
}

type userRepo struct {
	user User
}

func NewUserRepo(user User) *userRepo {
	return &userRepo{
		user: user,
	}
}
func (r *userRepo) Get(id string) (UserImpl, error) {
	if r.user == nil {
		return UserImpl{}, fmt.Errorf("user not found")
	}
	return r.user.Get(id)
}

func (m *UserMock) Get(id string) (UserImpl, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return UserImpl{}, args.Error(1)
	}
	return args.Get(0).(UserImpl), nil
}

func TestUser(t *testing.T) {
	tests := []struct {
		name   string
		mock   *UserMock
		want   UserImpl
		mockID string
		wantID string
	}{
		{
			name: "test with ID 1",
			mock: &UserMock{},
			want: UserImpl{
				Id: "1",
			},
			mockID: "1",
			wantID: "1",
		},
		//add more cases as needed
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockUser := test.mock
			mockUser.On("Get", test.mockID).Return(test.want, nil)

			userRep := NewUserRepo(mockUser)

			got, err := userRep.Get(test.mockID)
			if err != nil {
				t.Errorf("UserRepo.Get() error = %v", err)
				return
			}

			if got != test.want {
				t.Errorf("UserRepo.Get() = %+v, want %+v", got, test.want)
			}
		})
	}
}
