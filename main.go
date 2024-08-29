package main

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"log"
)

var (
	cfg aws.Config
)

func init() {
	var err error
	cfg, err = config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatal(err)
	}
}

func main() {

	// Create an Amazon S3 service client
	client := s3.NewFromConfig(cfg)

	r := gin.Default()
	r.GET("/", func(c *gin.Context) {

		// Get the first page of results for ListObjectsV2 for a bucket
		output, err := client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
			Bucket: aws.String("e-document-project"),
		})
		if err != nil {
			log.Fatal(err)
		}

		log.Println("first page results:")

		result := make(map[string]string)
		for _, object := range output.Contents {
			log.Printf("key=%s size=%d", aws.ToString(object.Key), object.Size)
			result[aws.ToString(object.Key)] = aws.ToString(object.Key)

		}

		c.JSON(200, gin.H{
			"message": result,
		})
	})

	log.Fatal(r.Run(":8088"))

}
