package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
)

type userRepository struct {
	ctx            context.Context
	userCollection *mongo.Collection
}

func NewUserRepository(ctx context.Context, userCollection *mongo.Collection) UserRepository {
	return &userRepository{
		ctx:            ctx,
		userCollection: userCollection,
	}
}
func (r *userRepository) UserCreate(user UserRepositoryImpl) error {
	return nil
}
func (r *userRepository) UserUpdate(user UserRepositoryImpl) error {
	return nil
}
func (r *userRepository) UserDelete(user UserRepositoryImpl) error {
	return nil
}
func (r *userRepository) UserList() ([]*UserRepositoryImpl, error) {
	return nil, nil
}
func (r *userRepository) UserView(userId string) (*UserRepositoryDB, error) {
	return nil, nil
}
