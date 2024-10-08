package repository

import "go.mongodb.org/mongo-driver/bson/primitive"

type DocumentRepository interface {
	Create(document *DocumentImpl) error
	Update(document *DocumentImpl) error
	Delete(docId string) error
	UpdateFiles(docId string, files []File) error
	UpdateStatus(docId string, status string) error
}

type DocumentImpl struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Year           int                `bson:"year,omitempty"`
	RegReceipt     string             `bson:"regReceipt"`
	SubjectCode    string             `bson:"subjectCode"`
	SubjectType    string             `bson:"subjectType"`
	SubjectTitle   string             `bson:"subjectTitle"`
	ReceivedDate   int64              `bson:"receivedDate,omitempty"`
	Sender         string             `bson:"sender"`
	Receiver       string             `bson:"receiver"`
	ReceivedBy     string             `bson:"receivedBy"`
	Status         string             `bson:"status,omitempty"`
	DocumentStatus string             `bson:"documentStatus"`
	DepartmentCode string             `bson:"departmentCode"`
	Acl            []int              `bson:"acl,omitempty"`
	Remarks        string             `bson:"remarks"`
	Files          []File             `bson:"files"`
	CreatedDate    int64              `bson:"createdDate,omitempty"`
	UpdatedDate    int64              `bson:"updatedDate,omitempty"`
}

type File struct {
	Name string `bson:"name"`
	url  string `bson:"url"`
}

type DocumentQuery struct {
	RegReceipt  string `bson:"regReceipt"`
	SubjectCode string `bson:"subjectCode"`
	SubjectType string `bson:"subjectType"`
	Year        int    `bson:"year"`
}
