package main

import (
	"context"
	conf2 "e-document/conf"
	"e-document/handler"
	"e-document/repository"
	"e-document/router"
	"e-document/services"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
)

const (
	USERS_COLLECTION       = "users"
	DEPARTMENTS_COLLECTION = "departments"
)

var (
	cfg    *conf2.AppConf
	client *mongo.Client
	ctx    context.Context
	server *gin.Engine

	//set data collection
	usersCollection       *mongo.Collection
	departmentsCollection *mongo.Collection

	//User
	UserHandler *handler.UserHandler
	UserRouter  *router.UserRouter

	//Department
	DepartmentHandler *handler.DepartmentHandler
	DepartmentRouter  *router.DepartmentRouter
)

func init() {

	ctx = context.TODO()

	// load app config
	cfg, _ = conf2.NewAppConf()
	// set client connection to db
	client = conf2.ConnectionDB()

	//User
	usersCollection = conf2.GetCollection(client, USERS_COLLECTION)
	userRepo := repository.NewUserRepository(ctx, usersCollection)
	userService := services.NewUserService(userRepo)
	UserHandler = handler.NewUserHandler(userService)
	UserRouter = router.NewUserRouter(UserHandler)

	//Department
	departmentsCollection = conf2.GetCollection(client, DEPARTMENTS_COLLECTION)
	deptRepo := repository.NewDepartmentRepository(ctx, departmentsCollection)
	deptService := services.NewDepartmentService(deptRepo)
	DepartmentHandler = handler.NewDepartmentHandler(deptService)
	DepartmentRouter = router.NewDepartmentRouter(DepartmentHandler)
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

	//no 404 url
	server.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"message": "404 page not found"})
		return
	})

	//router
	routes := server.Group("/api/v1")
	UserRouter.UserRoute(routes)
	DepartmentRouter.DepartmentRoute(routes)

	//serverRun

	log.Fatal(server.Run(":" + fmt.Sprintf("%v", config.App.Port)))

}

func main() {
	//config, _ := conf2.NewAppConf()
	ginServerStart(cfg)
}
