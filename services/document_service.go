package services

import "mime/multipart"

type documentService struct {
}

func NewDocumentService() DocumentService {
	return &documentService{}
}

func (s *documentService) UploadFile(file *multipart.FileHeader) (string, error) {
	return "", nil
}
func (s *documentService) DownloadFile(url string) (string, error) {
	return "", nil
}
