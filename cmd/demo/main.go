package main

import (
	"bytes"
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/gin-gonic/gin"
	"log"
	"os"
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

func multipartUpload(client *s3.Client, body []byte, uploadPath string, contentType string, fileSize int64, bucket string) error {
	input := &s3.CreateMultipartUploadInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(uploadPath),
		ContentType: aws.String(contentType),
	}
	resp, err := client.CreateMultipartUpload(context.TODO(), input)
	if err != nil {
		return err
	}

	var curr, partLength int64
	var remaining = fileSize
	var completedParts []types.CompletedPart
	//const maxPartSize int64 = int64(50 * 1024 * 1024)

	const maxPartSize = int64(50 * 1024 * 1024)

	partNumber := int32(1)
	for curr = 0; remaining != 0; curr += partLength {
		if remaining < maxPartSize {
			partLength = remaining
		} else {
			partLength = maxPartSize
		}

		partInput := &s3.UploadPartInput{
			Body:       bytes.NewReader(body[curr : curr+partLength]),
			Bucket:     resp.Bucket,
			Key:        resp.Key,
			PartNumber: aws.Int32(partNumber),
			UploadId:   resp.UploadId,
		}
		uploadResult, err := client.UploadPart(context.TODO(), partInput)
		if err != nil {
			aboInput := &s3.AbortMultipartUploadInput{
				Bucket:   resp.Bucket,
				Key:      resp.Key,
				UploadId: resp.UploadId,
			}
			_, aboErr := client.AbortMultipartUpload(context.TODO(), aboInput)
			if aboErr != nil {
				return aboErr
			}
			return err
		}

		completedParts = append(completedParts, types.CompletedPart{
			ETag:       uploadResult.ETag,
			PartNumber: aws.Int32(partNumber),
		})
		remaining -= partLength
		partNumber++
	}

	compInput := &s3.CompleteMultipartUploadInput{
		Bucket:   resp.Bucket,
		Key:      resp.Key,
		UploadId: resp.UploadId,
		MultipartUpload: &types.CompletedMultipartUpload{
			Parts: completedParts,
		},
	}
	_, compErr := client.CompleteMultipartUpload(context.TODO(), compInput)
	if compErr != nil {
		return compErr
	}

	return nil
}

func main() {

	// Create an Amazon S3 service client
	client := s3.NewFromConfig(cfg)

	r := gin.Default()
	r.GET("/", func(c *gin.Context) {

		fmt.Println("dddddddd")

		// Get the first page of results for ListObjectsV2 for a bucket
		output, err := client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
			Bucket: aws.String("e-document-project"),
		})
		if err != nil {
			log.Println(err)
		}

		log.Println("first page results : 99990")

		result := make(map[string]string)
		for _, object := range output.Contents {
			log.Printf("key=%s size=%d", aws.ToString(object.Key), object.Size)
			result[aws.ToString(object.Key)] = aws.ToString(object.Key)

		}

		c.JSON(200, gin.H{
			"message": result,
		})
	})

	r.POST("/", func(c *gin.Context) {

		file, err := c.FormFile("image")
		if err != nil {
			c.JSON(400, gin.H{
				"message": err.Error(),
			})
			return
		}

		// Upload File
		cl := s3.NewFromConfig(cfg)

		uploadFile, err := os.Open(file.Filename)
		if err != nil {
			c.JSON(400, gin.H{
				"message": err.Error(),
			})
			return
		}

		uploader := manager.NewUploader(cl)
		res, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
			Bucket: aws.String("e-document-project"),
			Key:    aws.String(file.Filename),
			Body:   uploadFile,
		})
		if err != nil {
			c.JSON(400, gin.H{
				"message": err.Error(),
			})
			return
		}

		//fmt.Printf("Uploaded file: %+v\n", file)

		//upFIle, err := os.OpenFile(file.Filename, os.O_WRONLY|os.O_CREATE, 0666)
		//if err != nil {
		//	c.JSON(400, gin.H{
		//		"message": err.Error(),
		//	})
		//	return
		//}

		//res := fmt.Sprintf("Uploaded file: %+v size: %v\n", file.Filename, file.Size)

		c.JSON(200, gin.H{
			"message": res.Location,
		})

	})

	log.Fatal(r.Run(":8088"))

}
