package services

import (
	"bufio"
	"e-document/repository"
	"fmt"
	"os"
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

	file, err := os.Create("/tmp/file.txt")
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer file.Close()

	writer := bufio.NewWriter(file)
	fmt.Println(writer)

	//perform writing operations
	_, err = writer.WriteString("Hello World\n")
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	// Ensure all buff
	err = writer.Flush()
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("File written successfully")
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
