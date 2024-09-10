package utils

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
)

var SecretKey = []byte("J@e2262527201934eopk898#")

func HashPassWord(password string) (string, error) {
	hashPassWord, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("error hashing password")
	}
	return string(hashPassWord), nil
}
func ComparePassword(password, hashPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hashPassword), []byte(password))
	if err != nil {
		return errors.New("error comparing password")
	}
	return nil
}
