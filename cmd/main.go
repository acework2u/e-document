package main

import (
	"context"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
)

const (
	USERLOGS_COLLECTION      = "user_logs"
	USERS_COLLECTION         = "users"
	DEPARTMENTS_COLLECTION   = "departments"
	DOCUMENTBOOKS_COLLECTION = "documentbooks"
	USERROLS_COLLECTION      = "user_roles"
	JOBSCHEDULES_COLLECTION  = "jobs"
)

var (
	server *gin.Engine
	ctx    context.Context
	client *mongo.Client
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "GIN OK",
		})
	})

	log.Fatal(r.Run(":8088"))

}
