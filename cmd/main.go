package main

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"log"
)

var (
	cfg aws.Config
)

func init() {
	var err error
	cfg, err = config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Printf("unable to load SDK config, %v", err)
	}
}

func main() {

	// Create an Amazon S3 service client
	//client := s3.NewFromConfig(cfg)
	//
	//r := gin.Default()
	//r.GET("/", func(c *gin.Context) {
	//
	//	fmt.Println("dddddddd")
	//
	//	c.JSON(200, gin.H{
	//		"message": result,
	//	})
	//})
	//
	//r.POST("/", func(c *gin.Context) {
	//
	//	file, err := c.FormFile("image")
	//	if err != nil {
	//		c.JSON(400, gin.H{
	//			"message": err.Error(),
	//		})
	//		return
	//	}
	//
	//	// Upload File
	//	cl := s3.NewFromConfig(cfg)
	//
	//	uploadFile, err := os.Open(file.Filename)
	//	if err != nil {
	//		c.JSON(400, gin.H{
	//			"message": err.Error(),
	//		})
	//		return
	//	}
	//
	//	uploader := manager.NewUploader(cl)
	//	res, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
	//		Bucket: aws.String("e-document-project"),
	//		Key:    aws.String(file.Filename),
	//		Body:   uploadFile,
	//	})
	//	if err != nil {
	//		c.JSON(400, gin.H{
	//			"message": err.Error(),
	//		})
	//		return
	//	}
	//
	//	c.JSON(200, gin.H{
	//		"message": res.Location,
	//	})
	//
	//})
	//
	//log.Fatal(r.Run(":8088"))

}
