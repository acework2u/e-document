package utils

import (
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"time"
)

var SecretKey = []byte("J@e2262527201934eopk898#")

func HashPassword(password string) (string, error) {
	hashPassWord, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("error hashing password")
	}
	return string(hashPassWord), nil
}
func ComparePassword(hashPassword, candidatePassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hashPassword), []byte(candidatePassword))
	if err != nil {
		return errors.New("error comparing password")
	}
	return nil
}
func JwtCreateToken(ttt time.Duration, username string, payload interface{}) (string, error) {
	// Create a new JWT token with claims
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": username,
		"exp": time.Now().Add(ttt).Unix(),
		"iat": time.Now().Unix(),
		"iss": payload,
	})
	// Print information about the crate token
	token, err := claims.SignedString(SecretKey)
	if err != nil {
		return "", errors.New("error creating token")
	}
	return token, nil
}

func HashPasswordWithSecret(password string, secret string) (string, error) {
	// Combine the password with the secret key
	secretKey := []byte(secret)
	combinedPassword := append([]byte(password), secretKey...)

	// Generate the hash
	hashPassWord, err := bcrypt.GenerateFromPassword(combinedPassword, bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("error hashing password with secret key")
	}
	return string(hashPassWord), nil
}

func VerifyPasswordWithSecret(hashPassword string, password string, secret string) error {
	// Combine the password with the secret key
	secretKey := []byte(secret)
	combinedPassword := append([]byte(password), secretKey...)

	// Compare the hashed password with the combined password
	err := bcrypt.CompareHashAndPassword([]byte(hashPassword), combinedPassword)
	if err != nil {
		return errors.New("error verifying password with secret key")
	}
	return nil
}
