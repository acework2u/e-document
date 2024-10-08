package middleware

import (
	"fmt"
	"github.com/acework2u/e-document/conf"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"log"
)

var (
	cfg *conf.AppConf
)

func Middleware(h gin.HandlerFunc, decors ...func(gin.HandlerFunc) gin.HandlerFunc) gin.HandlerFunc {
	//for i := len(decors) - 1; i >= 0; i-- {
	//	h = decors[i](h)
	//}
	for i := range decors {
		d := decors[len(decors)-1-i] // iterate in reverse
		h = d(h)
	}
	return h

}

func EditorAuthorization(handlerFunc gin.HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		roles, exists := c.Get("roles")
		if !exists || roles == nil {
			c.JSON(403, gin.H{"error": "Forbidden: no roles found in token"})
			c.Abort()
			return
		}
		roleList, ok := roles.([]interface{})
		if !ok {
			c.JSON(500, gin.H{"error": "Internal Server Error: invalid roles format"})
			c.Abort()
			return
		}

		isEditor := false

		for _, role := range roleList {
			roleString := fmt.Sprintf("%v", role)

			if roleString == "1" || roleString == "editor" {

				isEditor = true
				break
			}
		}

		if !isEditor {
			c.JSON(403, gin.H{"error": "Forbidden: user does not have editor role"})
			c.Abort()
			return
		}
		handlerFunc(c)
		//c.Next()
	}
}
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
func FinancialAuthorization(handlerFunc gin.HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		departments, exits := c.Get("payload")
		log.Println("work in Financial Authorizations")

		if !exits {
			c.JSON(403, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}
		departmentsMap, ok := departments.(map[string]interface{})
		if !ok {
			c.JSON(403, gin.H{"error": "Invalid claims"})
			c.Abort()
			return
		}

		isFinancial := false
		if departmentsMap["department"] == "fin" || departmentsMap["department"] == "finance" {
			isFinancial = true
		}

		if !isFinancial {
			c.JSON(403, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}

		handlerFunc(c)

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
func Authorization() gin.HandlerFunc {
	return func(c *gin.Context) {

		cfg, _ = conf.NewAppConf()
		secretKey := []byte(cfg.App.SecretKey)

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

		// Setting claims into context
		c.Set("claims", claims)
		c.Set("sub", claims["sub"])

		payload := claims["payload"].(map[string]interface{})
		c.Set("roles", payload["acl"])
		//log.Println("payload --> ACL")
		//log.Println(payload["acl"])
		c.Set("userid", payload["userid"])
		c.Set("userDepartment", payload["department"])
		c.Set("payload", payload)

		c.Next()
	}
}
