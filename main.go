package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

func ginServerStart() {

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
