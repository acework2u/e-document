package main

import (
	"context"
	"fmt"
	conf2 "github.com/acework2u/e-document/conf"
	"github.com/acework2u/e-document/handler"
	"github.com/acework2u/e-document/middleware"
	"github.com/acework2u/e-document/repository"
	"github.com/acework2u/e-document/router"
	"github.com/acework2u/e-document/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
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

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{config.App.ClientOrigin}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With"}
	server.Use(cors.New(corsConfig))
	server.Use(gin.Recovery())
	server.Use(gin.Logger())
	server.Use(middleware.Authentication())

	//no 404 url
	server.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"message": "404 page not found"})
		return
	})

	adminGroup := server.Group("/api/v1/admin")
	adminGroup.Use(middleware.AdminAuthorization())
	{
		rg := adminGroup.Group("/users")
		rg.GET("", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "admin user"})
		})
		adminGroup.GET("", func(c *gin.Context) { c.JSON(200, gin.H{"message": "admin"}) })
	}

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

func main() {
	//config, _ := conf2.NewAppConf()
	ginServerStart(cfg)
}
