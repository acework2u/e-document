package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"log"
)

func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		method := c.Request.Method

		log.Println("Authentication Middleware top")
		log.Println(path)
		log.Println(method)
		for _, p := range []string{"/api/v1/login", "/api/v1/register", "/api/v1/refresh", "/api/v1/users/signin"} {
			if path == p && method == "POST" {
				log.Println("Authentication Middleware 0")
				c.Next()
				return
			}
		}
		log.Println("Authentication Middleware 1")
		c.Next()
		log.Println("Authentication Middleware bottom")
	}

}

func AdminAuthorization() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("Admin Authorization Middleware")

		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(403, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}

		jwtClaims, ok := claims.(jwt.MapClaims)
		if !ok {
			c.JSON(403, gin.H{"error": "Invalid claims"})
			c.Abort()
			return
		}

		roles, ok := jwtClaims["roles"].([]interface{})
		if !ok {
			c.JSON(403, gin.H{"error": "No roles found in token"})
			c.Abort()
			return
		}

		isAdmin := false
		for _, role := range roles {
			if role == "admin" {
				isAdmin = true
				break
			}
		}

		if !isAdmin {
			c.JSON(403, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}

		c.Next()
	}
}
func StaffAuthorization() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("Admin Authorization Middleware")

		claims, exists := c.Get("claims")
		if !exists {
			c.JSON(403, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}

		jwtClaims, ok := claims.(jwt.MapClaims)
		if !ok {
			c.JSON(403, gin.H{"error": "Invalid claims"})
			c.Abort()
			return
		}

		roles, ok := jwtClaims["roles"].([]interface{})
		if !ok {
			c.JSON(403, gin.H{"error": "No roles found in token"})
			c.Abort()
			return
		}

		isStaff := false
		for _, role := range roles {

			if role == "staff" {
				isStaff = true
			}
		}

		if !isStaff {
			c.JSON(403, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}

		c.Next()
	}
}
func Authorization(secretKey []byte) gin.HandlerFunc {
	return func(c *gin.Context) {

		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		// Check for Bearer prefix and remove it
		if len(tokenString) <= 7 || tokenString[:7] != "Bearer " {
			c.JSON(401, gin.H{"error": "Invalid Authorization header"})
			c.Abort()
			return
		}
		tokenString = tokenString[7:] // Remove the "Bearer " prefix

		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})
		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"message": "Unauthorized"})
			c.Abort()
			return
		}

		//log.Println("Authorization Middleware")
		//log.Println(claims)
		//log.Println(claims["sub"])

		// Setting claims into context
		c.Set("claims", claims)
		c.Set("sub", claims["sub"])

		c.Next()
	}
}
