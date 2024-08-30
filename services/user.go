package services

type UserService interface {
	createUser(user *UserServiceImpl) (*UserServiceImpl, error)
	getUser(username string) (*UserServiceImpl, error)
	getUserByEmail(email string) (*UserServiceImpl, error)
	getUserByTel(tel string) (*UserServiceImpl, error)
	getUserByDepartment(departmentCode string) ([]*UserServiceImpl, error)
	getUserByAcl(acl []int)
	getUserByStatus(status int)
	getUserByUsername(username string)
	getUserById(id string)
	getUserByToken(token string)
	UpdateUser(user *UserServiceImpl) error
	DeleteUser(userId string) error
}

type UserServiceImpl struct {
	Name       string                `bson:"name"`
	Lastname   string                `bson:"lastname"`
	Email      string                `bson:"email"`
	Tel        string                `bson:"tel"`
	Department DepartmentServiceImpl `bson:"department"`
	Acl        []int                 `bson:"acl"`
	Status     int                   `bson:"status"`
	createdAt  int64                 `bson:"createdAt"`
	updatedAt  int64                 `bson:"updatedAt"`
}
type UserAuthenticationImpl struct {
	Username string `bson:"username"`
	Password string `bson:"password"`
}

type DepartmentServiceImpl struct {
	Code  string `bson:"code"`
	Title string `bson:"title"`
}
