package services

import (
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

func (s *userService) createUser(user *UserServiceImpl) (*UserServiceImpl, error) {
	return nil, nil
}
func (s *userService) GetUser(username string) (*UserServiceImpl, error) {

	return nil, nil
}
func (s *userService) getUserByEmail(email string) (*UserServiceImpl, error) {
	return nil, nil
}
func (s *userService) getUserByTel(tel string) (*UserServiceImpl, error) {
	return nil, nil
}
func (s *userService) getUserByDepartment(departmentCode string) ([]*UserServiceImpl, error) {
	return nil, nil
}
func (s *userService) getUserByAcl(acl []int) {

}
func (s *userService) getUserByStatus(status int) {

}
func (s *userService) getUserByUsername(username string) {

}
func (s *userService) getUserById(id string) {

}
func (s *userService) getUserByToken(token string) {

}
func (s *userService) UpdateUser(user *UserServiceImpl) error {
	return nil
}
func (s *userService) DeleteUser(userId string) error {
	return nil
}
