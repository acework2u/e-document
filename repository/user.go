package repository

import "go.mongodb.org/mongo-driver/bson/primitive"

type UserRepository interface {
	UserCreate(user UserRepositoryImpl) error
	UserUpdate(user UserRepositoryImpl) error
	UserDelete(user UserRepositoryImpl) error
	UserList() ([]*UserRepositoryImpl, error)
	UserView(userId string) (*UserRepositoryDB, error)
}

type UserRepositoryImpl struct {
	Name       string                   `bson:"name"`
	Lastname   string                   `bson:"lastname"`
	Email      string                   `bson:"email"`
	Tel        string                   `bson:"tel"`
	Department DepartmentRepositoryImpl `bson:"department"`
	Acl        []int                    `bson:"acl"`
	Status     int                      `bson:"status"`
	createdAt  int64                    `bson:"createdAt"`
	updatedAt  int64                    `bson:"updatedAt"`
}
type UserRepositoryDB struct {
	Id         primitive.ObjectID       `bson:"_id"`
	Name       string                   `bson:"name"`
	Lastname   string                   `bson:"lastname"`
	Email      string                   `bson:"email"`
	Tel        string                   `bson:"tel"`
	Department DepartmentRepositoryImpl `bson:"department"`
	Acl        []int                    `bson:"acl"`
	Status     int                      `bson:"status"`
	createdAt  int64                    `bson:"createdAt"`
	updatedAt  int64                    `bson:"updatedAt"`
}

type UserAuthenticationImpl struct {
	Username string `bson:"username"`
	Password string `bson:"password"`
}

type DepartmentRepositoryImpl struct {
	Code  string `bson:"code"`
	Title string `bson:"title"`
}
