package services

import (
	"github.com/acework2u/e-document/repository"
	"mime/multipart"
)

type documentService struct {
	documentRepo repository.DocumentRepository
}

func NewDocumentService(documentRepo repository.DocumentRepository) DocumentService {
	return &documentService{documentRepo: documentRepo}
}

func (s *documentService) UploadFile(file *multipart.FileHeader) (string, error) {
	return "", nil
}
func (s *documentService) DownloadFile(url string) (string, error) {
	return "", nil
}
