package repository

import "go.mongodb.org/mongo-driver/bson/primitive"

type UserRepository interface {
	UserCreate(user UserRepositoryImpl) (*UserRepositoryDB, error)
	UserUpdate(user UserRepositoryImpl) error
	UserDelete(userId string) error
	UserList(filter Filter) ([]*UserRepositoryImpl, error)
	UserView(userId string) (*UserRepositoryDB, error)
}

type UserRepositoryImpl struct {
	Id         string `bson:"_id"`
	Name       string `bson:"name"`
	Lastname   string `bson:"lastname"`
	Email      string `bson:"email"`
	Tel        string `bson:"tel"`
	Department string `bson:"department"`
	Acl        []int  `bson:"acl"`
	Status     int    `bson:"status"`
	createdAt  int64  `bson:"createdAt"`
	updatedAt  int64  `bson:"updatedAt"`
}
type UserRepositoryDB struct {
	Id         primitive.ObjectID `bson:"_id"`
	Name       string             `bson:"name"`
	Lastname   string             `bson:"lastname"`
	Email      string             `bson:"email"`
	Tel        string             `bson:"tel"`
	Department string             `bson:"department"`
	Acl        []int              `bson:"acl"`
	Status     int                `bson:"status"`
	CreatedAt  int64              `bson:"createdAt"`
	UpdatedAt  int64              `bson:"updatedAt"`
}

type UserAuthenticationImpl struct {
	Username string `bson:"username"`
	Password string `bson:"password"`
}
