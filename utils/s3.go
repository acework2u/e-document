package utils

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"log"
	"os"
	"time"
)

type Repo struct {
	s3Client          *s3.Client
	s3PresignedClient *s3.PresignClient
}

func NewS3Client(accessKey, secretKey, region string) *Repo {
	options := s3.Options{
		Region:      region,
		Credentials: aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	}

	client := s3.New(options, func(o *s3.Options) {
		o.Region = region
		o.UseAccelerate = false
	})
	resignClient := s3.NewPresignClient(client)
	return &Repo{
		s3Client:          client,
		s3PresignedClient: resignClient,
	}
}

func (repo Repo) PutObject(bucketName, objectKey string, lifetimeSecs int64) (*v4.PresignedHTTPRequest, error) {
	req, err := repo.s3PresignedClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Duration(lifetimeSecs * int64(time.Second))
	})
	if err != nil {
		log.Printf("Could not create presigned URL: %v", err)
	}
	return req, err

}
func (repo Repo) DeleteObject(bucketName, objectKey string, lifetimeSecs int64) (*v4.PresignedHTTPRequest, error) {
	req, err := repo.s3PresignedClient.PresignDeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	}, func(opts *s3.PresignOptions) { opts.Expires = time.Duration(lifetimeSecs * int64(time.Second)) })
	if err != nil {
		log.Printf("Could not create presigned URL: %v", err)
	}
	return req, err
}
func (repo Repo) UploadFile(bucketName, objectKey, filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("unable to open file %q, %v", filePath, err)
	}
	defer file.Close()

	_, err = repo.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
		Body:   file,
	})
	if err != nil {
		return fmt.Errorf("unable to upload %q to %q, %v", filePath, bucketName, err)
	}

	return nil
}
func (repo Repo) DeleteFile(bucketName, objectKey string) error {
	_, err := repo.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return fmt.Errorf("unable to delete object %q from bucket %q, %v", objectKey, bucketName, err)
	}

	return nil

}
