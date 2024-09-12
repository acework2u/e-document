package middleware

import (
	"github.com/gin-gonic/gin"
	"log"
)

func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {

		log.Println("Authentication Middleware")
		c.Next()
		log.Println("Authentication Middleware bottom")
	}

}

func Authorization() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("Authorization Middleware")
	}
}
func AdminAuthorization() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("Admin Authorization Middleware")
	}

}
