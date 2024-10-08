package repository

import "go.mongodb.org/mongo-driver/bson/primitive"

type UserRepository interface {
	UserCreate(user UserRepositoryImpl) (*UserRepositoryDB, error)
	UserUpdate(id string, user UserRepositoryImpl) error
	UserDelete(userId string) error
	UserList(filter Filter) ([]*UserRepositoryImpl, error)
	UserView(userId string) (*UserRepositoryDB, error)
	SetPassword(userId string, password string) error
	SetAcl(userId string, acl []int) error
	UserSignIn(user *UserAuthenticationImpl) (*UserRepositoryDB, error)
}

type UserRepositoryImpl struct {
	Id         string `bson:"_id,omitempty"`
	Username   string `bson:"username"`
	Password   string `bson:"password"`
	Name       string `bson:"name"`
	Lastname   string `bson:"lastname"`
	Email      string `bson:"email"`
	Tel        string `bson:"tel"`
	Department string `bson:"department"`
	Acl        []int  `bson:"acl"`
	Status     int    `bson:"status"`
	CreatedAt  int64  `bson:"createdAt,omitempty"`
	UpdatedAt  int64  `bson:"updatedAt,omitempty"`
}
type UserRepositoryDB struct {
	Id         primitive.ObjectID `bson:"_id"`
	Username   string             `bson:"username"`
	Password   string             `bson:"password"`
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
