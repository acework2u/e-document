package services

import (
	"errors"
	"github.com/acework2u/e-document/repository"
)

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}
func (s *userService) CreateUser(user *UserServiceImpl) (*UserServiceImpl, error) {

	if err := validateUser(user); err != nil {
		return nil, err
	}

	userData := repository.UserRepositoryImpl{
		Name:       user.Name,
		Lastname:   user.Lastname,
		Email:      user.Email,
		Tel:        user.Tel,
		Department: user.Department,
		Acl:        user.Acl,
		Status:     user.Status,
	}

	userInfo, err := s.userRepo.UserCreate(userData)
	if err != nil {
		return nil, err
	}

	userResponse := &UserServiceImpl{
		Id:         userInfo.Id.Hex(),
		Name:       userInfo.Name,
		Lastname:   userInfo.Lastname,
		Email:      userInfo.Email,
		Tel:        userInfo.Tel,
		Department: userInfo.Department,
		Acl:        userInfo.Acl,
		Status:     userInfo.Status,
		CreatedAt:  userInfo.CreatedAt,
		UpdatedAt:  userInfo.UpdatedAt,
	}

	return userResponse, nil
}
func (s *userService) UpdateUser(user *UserServiceImpl) error {

	return nil
}
func (s *userService) DeleteUser(userId string) error {
	return nil
}
func (s *userService) ViewUser(userId string) (*UserServiceImpl, error) {
	return nil, nil
}

func validateUser(user *UserServiceImpl) error {
	if user.Email == "" {
		return errors.New("email is required")
	}
	if user.Lastname == "" {
		return errors.New("lastname is required")
	}
	if user.Name == "" {
		return errors.New("name is required")
	}
	if user.Department == "" {
		return errors.New("department is required")
	}

	if user.Acl == nil || len(user.Acl) == 0 {
		return errors.New("acl is required")
	}
	if user.Status == 0 {
		return errors.New("status is required")
	}
	return nil
}
