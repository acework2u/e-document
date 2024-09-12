package services

type UserService interface {
	CreateUser(user *UserServiceImpl) (*UserServiceImpl, error)
	UpdateUser(user *UserUpdateService) error
	DeleteUser(userId string) error
	ListUser(filter Filter) ([]*UserServiceImpl, error)
	ViewUser(userId string) (*UserServiceResponse, error)
	SignIn(userImpl *UserAuthenticationImpl) (*AuthenticationResponse, error)
	SignOut(userId string) error
	ChangePassword(userId string, password string) error
}

type UserServiceImpl struct {
	Id         string `json:"id"`
	Username   string `json:"username" binding:"required" min:"3" max:"20"`
	Password   string `json:"password" binding:"required" min:"3" max:"20"`
	Name       string `json:"name" binding:"required" min:"3" max:"20"`
	Lastname   string `json:"lastname" binding:"required" min:"3" max:"20"`
	Email      string `json:"email" binding:"required" min:"3" max:"50"`
	Tel        string `json:"tel" min:"10" max:"10"`
	Department string `json:"department" binding:"required" min:"3" max:"20"`
	Acl        []int  `json:"acl" default:"[1]"`
	Status     int    `json:"status" default:"1"`
	CreatedAt  int64  `json:"createdAt" default:"0"`
	UpdatedAt  int64  `json:"updatedAt" default:"0"`
}

type UserUpdateService struct {
	Id         string `json:"id"`
	Name       string `json:"name" binding:"required" min:"3" max:"20"`
	Lastname   string `json:"lastname" binding:"required" min:"3" max:"20"`
	Email      string `json:"email" binding:"required" min:"3" max:"50"`
	Tel        string `json:"tel" min:"10" max:"10"`
	Department string `json:"department" binding:"required" min:"3" max:"20"`
	Acl        []int  `json:"acl" default:"[1]"`
	Status     int    `json:"status" default:"1"`
	CreatedAt  int64  `json:"createdAt" default:"0"`
	UpdatedAt  int64  `json:"updatedAt" default:"0"`
}

type UserServiceResponse struct {
	Id         string `json:"id"`
	Name       string `json:"name" binding:"required" min:"3" max:"20"`
	Lastname   string `json:"lastname" binding:"required" min:"3" max:"20"`
	Email      string `json:"email" binding:"required" min:"3" max:"50"`
	Tel        string `json:"tel" min:"10" max:"10"`
	Department string `json:"department" binding:"required" min:"3" max:"20"`
	Acl        []int  `json:"acl" default:"[1]"`
	Status     int    `json:"status" default:"1"`
	CreatedAt  int64  `json:"createdAt" default:"0"`
	UpdatedAt  int64  `json:"updatedAt" default:"0"`
}

type UserAuthenticationImpl struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required" min:"8" max:"20"`
}
type AuthenticationResponse struct {
	Token string `json:"token"`
}

type DepartmentServiceImpl struct {
	Code  string `json:"code"`
	Title string `json:"title"`
}
type PasswordReset struct {
	Password string `json:"password" binding:"required" min:"8" max:"20"`
	Token    string `json:"token"`
}
