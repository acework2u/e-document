package main

import (
	"context"
	"fmt"
	conf2 "github.com/acework2u/e-document/conf"
	"github.com/acework2u/e-document/docs"
	"github.com/acework2u/e-document/handler"
	"github.com/acework2u/e-document/middleware"
	"github.com/acework2u/e-document/repository"
	"github.com/acework2u/e-document/router"
	"github.com/acework2u/e-document/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
	"strings"
)

const (
	UsersCollection       = "users"
	DepartmentsCollection = "departments"
	DocumentsCollection   = "documents"
)

var (
	cfg    *conf2.AppConf
	client *mongo.Client
	ctx    context.Context
	server *gin.Engine

	// UserCollection
	usersCollection       *mongo.Collection
	departmentsCollection *mongo.Collection
	documentsCollection   *mongo.Collection

	UserHandler *handler.UserHandler
	UserRouter  *router.UserRouter

	DepartmentHandler *handler.DepartmentHandler
	DepartmentRouter  *router.DepartmentRouter

	DocumentHandler *handler.DocumentHandler
	DocumentRouter  *router.DocumentRouter
)

func init() {

	ctx = context.TODO()

	// load app config
	cfg, _ = conf2.NewAppConf()
	// set client connection to db
	client = conf2.ConnectionDB()

	//User
	usersCollection = conf2.GetCollection(client, UsersCollection)
	userRepo := repository.NewUserRepository(ctx, usersCollection)
	userService := services.NewUserService(userRepo)
	UserHandler = handler.NewUserHandler(userService)
	UserRouter = router.NewUserRouter(UserHandler, cfg)

	//Department
	departmentsCollection = conf2.GetCollection(client, DepartmentsCollection)
	deptRepo := repository.NewDepartmentRepository(ctx, departmentsCollection)
	deptService := services.NewDepartmentService(deptRepo)
	DepartmentHandler = handler.NewDepartmentHandler(deptService)
	DepartmentRouter = router.NewDepartmentRouter(DepartmentHandler)

	//Document
	documentsCollection = conf2.GetCollection(client, DocumentsCollection)
	docRepo := repository.NewDocumentRepository(ctx, documentsCollection)
	docService := services.NewDocumentService(docRepo)
	DocumentHandler = handler.NewDocument(docService)
	DocumentRouter = router.NewDocumentRouter(DocumentHandler)

	// init gin server mode
	server = gin.Default()

}
func ginServerStart(config *conf2.AppConf) {

	clientOrigin := config.App.ClientOrigin
	if clientOrigin == "" {
		clientOrigin = "*"
	}
	corsConfig := cors.DefaultConfig()
	//corsConfig.AllowOrigins = []string{clientOrigin}
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With"}
	corsConfig.ExposeHeaders = []string{"Content-Length"}
	corsConfig.MaxAge = 12 * 3600
	server.Use(cors.New(corsConfig))
	//server.Use(corsMiddleware2())
	server.Use(gin.Recovery())
	server.Use(gin.Logger())
	server.Use(middleware.Authentication())

	//no 404 url
	server.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"message": "404 page not found"})
		return
	})

	//adminGroup := server.Group("/api/v1/admin")
	////adminGroup.Use(middleware.AdminAuthorization())
	//{
	//	rg := adminGroup.Group("/users")
	//	rg.GET("", func(c *gin.Context) {
	//		c.JSON(200, gin.H{"message": "admin user"})
	//	})
	//	adminGroup.GET("", func(c *gin.Context) { c.JSON(200, gin.H{"message": "admin"}) })
	//}
	docs.SwaggerInfo.BasePath = "/api/v1"
	server.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	server.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	//router
	routes := server.Group("/api/v1")

	UserRouter.UserRoute(routes)
	DepartmentRouter.DepartmentRoute(routes)
	DocumentRouter.DocumentRoute(routes)

	//serverRun
	serverPort := config.App.Port
	if serverPort == "" {
		serverPort = "8080"
	}

	log.Fatal(server.Run(":" + fmt.Sprintf("%v", serverPort)))

}

// @Title main initializes the server configuration and starts the Gin server.
// @host localhost:8088
// @BasePath /api/v1
func main() {
	//config, _ := conf2.NewAppConf()
	ginServerStart(cfg)
}
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// CORS middleware function definition
func corsMiddleware2() gin.HandlerFunc {
	// Define allowed origins as a comma-separated string
	originsString := "https://localhost,https://localhost:8080,http://localhost,http://localhost:8080,http://localhost:3000"
	var allowedOrigins []string
	// Split the originsString into individual origins and store them in allowedOrigins slice
	allowedOrigins = strings.Split(originsString, ",")

	// Return the actual middleware handler function
	return func(c *gin.Context) {
		// Function to check if a given origin is allowed
		isOriginAllowed := func(origin string, allowedOrigins []string) bool {
			for _, allowedOrigin := range allowedOrigins {
				if origin == allowedOrigin {
					return true
				}
			}
			return false
		}

		// Get the Origin header from the request
		origin := c.Request.Header.Get("Origin")

		// Check if the origin is allowed
		if isOriginAllowed(origin, allowedOrigins) {
			// If the origin is allowed, set CORS headers in the response
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")
		}

		// Handle preflight OPTIONS requests by aborting with status 204
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		// Call the next handler
		c.Next()
	}
}
