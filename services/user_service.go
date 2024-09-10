package services

import (
	"errors"
	"github.com/acework2u/e-document/repository"
	"github.com/acework2u/e-document/utils"
	"time"
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
	password, err := utils.HashPassword(user.Password)
	if err != nil {
		return nil, errors.New("error hashing password")
	}

	userData := repository.UserRepositoryImpl{
		Username:   user.Username,
		Password:   password,
		Name:       user.Name,
		Lastname:   user.Lastname,
		Email:      user.Email,
		Tel:        user.Tel,
		Department: user.Department,
		Acl:        user.Acl,
		Status:     user.Status,
		CreatedAt:  time.Now().Unix(),
		UpdatedAt:  time.Now().Unix(),
	}

	userInfo, err := s.userRepo.UserCreate(userData)
	if err != nil {
		return nil, err
	}

	userResponse := &UserServiceImpl{
		Id:         userInfo.Id.Hex(),
		Username:   userInfo.Username,
		Password:   password,
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
func (s *userService) UpdateUser(user *UserUpdateService) error {

	return nil
}
func (s *userService) DeleteUser(userId string) error {
	if userId == "" {
		return errors.New("user id is required")
	}
	err := s.userRepo.UserDelete(userId)
	if err != nil {
		return err
	}

	return err
}
func (s *userService) ListUser(filter Filter) (users []*UserServiceImpl, err error) {

	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Sort == "" {
		filter.Sort = "asc"
	}

	filters := repository.Filter{
		Limit:   filter.Limit,
		Page:    filter.Page,
		Sort:    filter.Sort,
		Keyword: filter.Keyword,
	}

	result, err := s.userRepo.UserList(filters)
	if err != nil {
		return nil, err
	}

	if len(result) == 0 {
		return nil, errors.New("no data found")
	}

	for _, val := range result {
		user := &UserServiceImpl{
			Id:         val.Id,
			Username:   val.Username,
			Name:       val.Name,
			Lastname:   val.Lastname,
			Email:      val.Email,
			Tel:        val.Tel,
			Department: val.Department,
			Acl:        val.Acl,
			Status:     val.Status,
			CreatedAt:  val.CreatedAt,
			UpdatedAt:  val.UpdatedAt,
		}

		users = append(users, user)

	}

	return users, nil
}
func (s *userService) ViewUser(userId string) (*UserServiceResponse, error) {
	if userId == "" {
		return nil, errors.New("user id is required")
	}
	result, err := s.userRepo.UserView(userId)
	if err != nil {
		return nil, errors.New("user not found")
	}
	if result == nil {
		return nil, errors.New("user not found")
	}

	user := &UserServiceResponse{
		Id:         result.Id.Hex(),
		Name:       result.Name,
		Lastname:   result.Lastname,
		Email:      result.Email,
		Tel:        result.Tel,
		Department: result.Department,
		Acl:        result.Acl,
		Status:     result.Status,
		CreatedAt:  result.CreatedAt,
		UpdatedAt:  result.UpdatedAt,
	}
	return user, err
}
func (s *userService) SignIn(userImpl *UserAuthenticationImpl) (*UserServiceImpl, error) {
	return nil, nil
}
func (s *userService) SignOut(userId string) error {
	return nil
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
