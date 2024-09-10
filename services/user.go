package services

type UserService interface {
	CreateUser(user *UserServiceImpl) (*UserServiceImpl, error)
	UpdateUser(user *UserServiceImpl) error
	DeleteUser(userId string) error
	ViewUser(userId string) (*UserServiceImpl, error)
	SignIn(userImpl *UserAuthenticationImpl) (*UserServiceImpl, error)
	SignOut(userId string) error
}

type UserServiceImpl struct {
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
	Username string `json:"username"`
	Password string `json:"password"`
}

type DepartmentServiceImpl struct {
	Code  string `json:"code"`
	Title string `json:"title"`
}
