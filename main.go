package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "GIN OK",
		})
	})

	log.Fatal(r.Run(":8088"))

	fmt.Printf("Hello World out")
}
