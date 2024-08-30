package services

import "mime/multipart"

type DocumentService interface {
	UploadFile(file *multipart.FileHeader) (string, error)
	DownloadFile(url string) (string, error)
}

type Document struct{}
