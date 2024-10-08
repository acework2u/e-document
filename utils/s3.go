package utils

import (
	"context"
	"fmt"
	"github.com/acework2u/e-document/conf"
	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"log"
	"mime/multipart"
	"os"
	"time"
)

const maxFileSize = 5 * 1024 * 1024 // Maximum file size allowed in bytes : 5MB
const bucketName = "e-document-files-center"

var appConfig *conf.AppConf

type Repo struct {
	s3Client          *s3.Client
	s3PresignedClient *s3.PresignClient
	BucketName        string
}

func NewS3Client(accessKey, secretKey, region string) *Repo {

	appConfig, _ = conf.NewAppConf()

	if region == "" {
		region = appConfig.S3config.AwsRegion
	}
	if accessKey == "" {
		accessKey = appConfig.S3config.AwsAccessKey
	}
	if secretKey == "" {
		secretKey = appConfig.S3config.AwsSecretKey
	}

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
		BucketName:        bucketName,
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
	defer func(file *os.File) {
		_ = file.Close()
	}(file)

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
func (repo Repo) UploadFileToS3(key string, file multipart.File) (string, error) {
	uploader := manager.NewUploader(repo.s3Client)
	// Upload the file to S3
	_, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
		Body:   file,
	})
	if err != nil {
		return "", fmt.Errorf("unable to upload %q to %q, %v", key, bucketName, err)
	}
	// Generate the S3 file path (URL)
	fileUrl := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", bucketName, key)
	return fileUrl, nil
}
func (repo Repo) DeleteFileFromS3(key string) error {
	delRes, err := repo.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(repo.BucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("unable to delete object %q from bucket %q: %v", key, repo.BucketName, err)
	}

	if delRes.DeleteMarker != nil && *delRes.DeleteMarker {
		return nil
	}

	if delRes.VersionId != nil {
		return nil
	}

	return fmt.Errorf("object %q from bucket %q may not be fully deleted", key, repo.BucketName)
}
