package services

import "mime/multipart"

type DocumentService interface {
	UploadFile(docId string, files *multipart.Form) error
	DownloadFile(url string) (string, error)
	CreateDocument(document DocumentImpl) error
	GetDocument(id string) (*Document, error)
	UpdateDocument(id string, document DocumentImpl) error
	DeleteDocument(id string) error
	GetDocuments(filter Filter) ([]*Document, int64, error)
	GetFiles(id string, filter Filter) ([]*File, error)
	DeleteFile(id string, file string) error
}

type Document struct {
	ID             string `json:"id,omitempty"`
	Year           string `json:"year,omitempty"`
	RegReceipt     string `json:"regReceipt" binding:"required"`
	SubjectCode    string `json:"subjectCode" binding:"required"`
	SubjectType    string `json:"subjectType" binding:"required"`
	SubjectTitle   string `json:"subjectTitle" binding:"required"`
	SubjectDetail  string `json:"subjectDetail"`
	ReceivedDate   string `json:"receivedDate,omitempty" binding:"required"`
	Sender         string `json:"sender" binding:"required"`
	Receiver       string `json:"receiver" binding:"required"`
	ReceivedBy     string `json:"receivedBy"`
	Status         string `json:"status,omitempty"`
	DocumentStatus string `json:"documentStatus"`
	DepartmentCode string `json:"departmentCode"`
	Acl            []int  `json:"acl,omitempty"`
	Files          []File `json:"files"`
	CreatedDate    string `json:"createdDate,omitempty"`
	UpdatedDate    string `json:"updatedDate,omitempty"`
}
type DocumentImpl struct {
	ID             string `json:"id,omitempty"`
	Year           string `json:"year,omitempty,max=4"`
	RegReceipt     string `json:"regReceipt" binding:"required,max=20" time_format:"2006-01-02"`
	SubjectCode    string `json:"subjectCode" binding:"required,max=20"`
	SubjectType    string `json:"subjectType" binding:"required,max=20"`
	SubjectTitle   string `json:"subjectTitle" binding:"required,max=80"`
	SubjectDetail  string `json:"subjectDetail" binding:"max=80"`
	ReceivedDate   string `json:"receivedDate,omitempty" binding:"required"`
	Sender         string `json:"sender" binding:"required,max=80"`
	Receiver       string `json:"receiver" binding:"required,max=80"`
	ReceivedBy     string `json:"receivedBy"`
	Status         string `json:"status,omitempty,max=20"`
	DocumentStatus string `json:"documentStatus,max=20"`
	DepartmentCode string `json:"departmentCode,max=20"`
	Acl            []int  `json:"acl,omitempty"`
	Files          []File `json:"files"`
	CreatedDate    int64  `json:"createdDate,omitempty"`
	UpdatedDate    int64  `json:"updatedDate,omitempty"`
}
type File struct {
	Name string `json:"name"`
	Url  string `json:"url"`
}
type DelFileInput struct {
	FileName string `json:"filename" binding:"required"`
}
