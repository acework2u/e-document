package middleware

import (
	"github.com/acework2u/e-document/conf"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"log"
)

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

		log.Println("Authorization Middleware")
		c.Next()
	}
}

func AdminAuthorization(handlerFunc gin.HandlerFunc) gin.HandlerFunc {
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

		roles, ok := jwtClaims["payload"].(map[string]interface{})["acl"].([]interface{})
		if !ok {
			c.JSON(403, gin.H{"error": "No roles found in token"})
			c.Abort()
			return
		}

		isAdmin := false
		for _, role := range roles {

			//log.Println(reflect.TypeOf(role))
			if role == "admin" || role == "administrator" || role == float64(1) {
				isAdmin = true
				break
			}
		}

		if !isAdmin {
			c.JSON(403, gin.H{"error": "forbidden, please contact the administrator"})
			c.Abort()
			return
		}

		handlerFunc(c)
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
