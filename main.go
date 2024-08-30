package main

import (
	conf2 "e-document/conf"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"log"
)

var (
	cfg    *conf2.AppConf
	client *mongo.Client
)

func ginServerStart() {

}

func init() {
	var err error

	cfg, err = conf2.NewAppConf()
	client = conf2.ConnectionDB()

	fmt.Println("Config-------load-------->")

	if err != nil {
		fmt.Println("load conf err:", err)
		log.Fatal(err)
	}
	fmt.Println(cfg.DB)

}

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "hello world",
		})
	})

	log.Fatal(r.Run(":8088"))
}
