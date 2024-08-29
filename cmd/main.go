package main

import (
	"context"
	"fmt"
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

	fmt.Println("Starting server...")
	fmt.Println(USERS_COLLECTION)
	fmt.Println(USERLOGS_COLLECTION)
	fmt.Println(DEPARTMENTS_COLLECTION)
	fmt.Println(DOCUMENTBOOKS_COLLECTION)
	fmt.Println(USERROLS_COLLECTION)
	fmt.Println(JOBSCHEDULES_COLLECTION)

	r := gin.Default()
	r.GET("/", func(c *gin.Context) {

		c.JSON(200, gin.H{
			"message": "E-Document Management",
		})
	})

	log.Fatal(r.Run(":8088"))

}
