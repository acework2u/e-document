package middleware

import (
	"fmt"
	"github.com/acework2u/e-document/conf"
	"github.com/gin-gonic/gin"
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
		c.Next()

	}

}
