package services

import (
	"errors"
	"github.com/acework2u/e-document/repository"
	"github.com/acework2u/e-document/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"log"
	"mime/multipart"
	"strconv"
	"time"
)

type documentService struct {
	documentRepo repository.DocumentRepository
}

func NewDocumentService(documentRepo repository.DocumentRepository) DocumentService {
	return &documentService{documentRepo: documentRepo}
}

func (s *documentService) CreateDocument(document DocumentImpl) error {

	year, err := strconv.Atoi(document.Year)
	if err != nil {
		return err
	}

	receivedDate, err := time.Parse("2006-01-02", document.ReceivedDate)
	if err != nil {
		return errors.New(
			"Invalid date format. Expected format: 2006-01-02")
	}
	receivedDateInt := receivedDate.Unix()
	now := time.Now().Unix()

	files := make([]repository.File, 0, len(document.Files))
	for _, val := range document.Files {
		file := repository.File{
			Name: val.Name,
			Url:  val.Url,
		}
		files = append(files, file)
	}

	resp, err := s.documentRepo.Create(&repository.DocumentImpl{
		ID:             primitive.ObjectID{},
		Year:           year,
		RegReceipt:     document.RegReceipt,
		SubjectCode:    document.SubjectCode,
		SubjectType:    document.SubjectType,
		SubjectTitle:   document.SubjectTitle,
		ReceivedDate:   receivedDateInt,
		Sender:         document.Sender,
		Receiver:       document.Receiver,
		ReceivedBy:     document.ReceivedBy,
		Status:         document.Status,
		DocumentStatus: document.DocumentStatus,
		DepartmentCode: document.DepartmentCode,
		Acl:            document.Acl,
		Remarks:        document.SubjectDetail,
		Files:          files,
		CreatedDate:    now,
		UpdatedDate:    now,
	})
	if err != nil {
		return err
	}

	_ = resp

	return nil
}
func (s *documentService) GetDocuments(filter Filter) ([]*Document, error) {
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Sort == "" {
		filter.Sort = "asc"
	}

	filters := repository.Filter{
		Limit:   filter.Limit,
		Page:    filter.Page,
		Sort:    filter.Sort,
		Keyword: filter.Keyword,
	}

	result, err := s.documentRepo.List(filters)
	if err != nil {
		return nil, err
	}

	documents := make([]*Document, 0, len(result))
	for _, val := range result {
		// Files
		files := make([]File, 0, len(val.Files))
		for _, val := range val.Files {
			file := File{
				Name: val.Name,
				Url:  val.Url,
			}
			files = append(files, file)
		}

		document := &Document{
			ID:             val.ID.Hex(),
			Year:           strconv.Itoa(val.Year),
			RegReceipt:     val.RegReceipt,
			SubjectCode:    val.SubjectCode,
			SubjectType:    val.SubjectType,
			SubjectTitle:   val.SubjectTitle,
			SubjectDetail:  val.Remarks,
			ReceivedDate:   utils.TimeInt64ToString(val.ReceivedDate),
			Sender:         val.Sender,
			Receiver:       val.Receiver,
			ReceivedBy:     val.ReceivedBy,
			Status:         val.Status,
			DocumentStatus: val.DocumentStatus,
			DepartmentCode: val.DepartmentCode,
			Acl:            val.Acl,
			Files:          files,
			CreatedDate:    utils.TimeInt64ToString(val.CreatedDate),
			UpdatedDate:    utils.TimeInt64ToString(val.UpdatedDate),
		}

		documents = append(documents, document)
	}
	return documents, nil
}
func (s *documentService) GetDocument(id string) (*Document, error) {
	if id == "" {
		return nil, errors.New("invalid id")
	}
	resDoc, err := s.documentRepo.FindById(id)
	if err != nil {
		return nil, err
	}

	files := make([]File, 0, len(resDoc.Files))
	for _, val := range resDoc.Files {
		file := File{
			Name: val.Name,
			Url:  val.Url,
		}
		files = append(files, file)
	}

	document := &Document{
		ID:             resDoc.ID.Hex(),
		Year:           strconv.Itoa(resDoc.Year),
		RegReceipt:     resDoc.RegReceipt,
		SubjectCode:    resDoc.SubjectCode,
		SubjectType:    resDoc.SubjectType,
		SubjectTitle:   resDoc.SubjectTitle,
		SubjectDetail:  resDoc.Remarks,
		ReceivedDate:   utils.TimeInt64ToString(resDoc.ReceivedDate),
		Sender:         resDoc.Sender,
		Receiver:       resDoc.Receiver,
		ReceivedBy:     resDoc.ReceivedBy,
		Status:         resDoc.Status,
		DocumentStatus: resDoc.DocumentStatus,
		DepartmentCode: resDoc.DepartmentCode,
		Acl:            resDoc.Acl,
		Files:          files,
		CreatedDate:    utils.TimeInt64ToString(resDoc.CreatedDate),
		UpdatedDate:    utils.TimeInt64ToString(resDoc.UpdatedDate),
	}

	return document, nil
}
func (s *documentService) UpdateDocument(id string, document DocumentImpl) error {
	if id == "" {
		return errors.New("invalid id")
	}
	repoDoc, err := s.documentRepo.FindById(id)
	if err != nil {
		return err
	}
	if repoDoc == nil {
		return errors.New("document not found")
	}
	year, err := strconv.Atoi(document.Year)
	if err != nil {
		return err
	}
	receivedDate, err := time.Parse("2006-01-02", document.ReceivedDate)
	if err != nil {
		return err
	}
	files := make([]repository.File, 0, len(document.Files))
	if len(document.Files) > 0 {
		for _, val := range document.Files {
			file := repository.File{
				Name: val.Name,
				Url:  val.Url,
			}
			files = append(files, file)
		}
	} else {
		files = repoDoc.Files
	}

	now := time.Now().Unix()

	dataDocument := &repository.DocumentImpl{
		ID:             repoDoc.ID,
		Year:           year,
		RegReceipt:     document.RegReceipt,
		SubjectCode:    document.SubjectCode,
		SubjectType:    document.SubjectType,
		SubjectTitle:   document.SubjectTitle,
		ReceivedDate:   receivedDate.Unix(),
		Sender:         document.Sender,
		Receiver:       document.Receiver,
		ReceivedBy:     document.ReceivedBy,
		Status:         document.Status,
		DocumentStatus: document.DocumentStatus,
		DepartmentCode: document.DepartmentCode,
		Acl:            document.Acl,
		Remarks:        document.SubjectDetail,
		Files:          files,
		UpdatedDate:    now,
	}

	err = s.documentRepo.Update(dataDocument)
	if err != nil {
		return err
	}
	return nil

}
func (s *documentService) DeleteDocument(id string) error {
	if id == "" {
		return errors.New("invalid id")
	}
	err := s.documentRepo.Delete(id)
	if err != nil {
		return err
	}
	return err
}
func (s *documentService) UploadFile(id string, form *multipart.Form) error {

	if id == "" {
		return errors.New("invalid id")
	}

	findExits, err := s.documentRepo.FindById(id)
	if err != nil {
		return err
	}

	originFiles := findExits.Files
	files := make([]repository.File, 0, len(form.File["uploads[]"]))

	for i, val := range form.File["uploads[]"] {
		f, err := val.Open()
		if err != nil {
			return err
		}
		defer f.Close()
		suffix := i + 1
		newFileName := utils.GenerateNewFileName(val.Filename, id, suffix)
		uploader := utils.NewS3Client("", "", "")
		fileUrl, err := uploader.UploadFileToS3(newFileName, f)
		if err != nil {
			return err
		}
		file := repository.File{
			Name: val.Filename,
			Url:  fileUrl,
		}
		files = append(files, file)
	}
	// add file into origin files
	originFiles = append(originFiles, files...)
	err = s.documentRepo.UpdateFiles(id, originFiles)
	if err != nil {
		return err
	}

	return nil
}
func (s *documentService) DownloadFile(url string) (string, error) {
	return "", nil
}
func (s *documentService) GetFiles(id string, filter Filter) ([]*File, error) {
	if id == "" {
		return nil, errors.New("invalid id")
	}
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}

	if filter.Sort != "asc" && filter.Sort != "desc" {
		filter.Sort = "asc"
	}

	//filters := repository.Filter{
	//	Page:    filter.Page,
	//	Limit:   filter.Limit,
	//	Sort:    filter.Sort,
	//	Keyword: "",
	//}

	resDoc, err := s.documentRepo.FindById(id)

	if err != nil {
		return nil, err
	}
	if resDoc == nil {
		return nil, errors.New("document not found")
	}
	if len(resDoc.Files) == 0 {
		return nil, errors.New("document has no file")
	}

	files := make([]*File, 0, len(resDoc.Files))
	for _, val := range resDoc.Files {
		file := File{
			Name: val.Name,
			Url:  val.Url,
		}
		files = append(files, &file)

	}

	return files, nil

}
func (s *documentService) DeleteFile(id string, file string) error {
	if id == "" {
		return errors.New("invalid id")
	}
	if file == "" {
		return errors.New("invalid file")
	}
	doc, err := s.documentRepo.FindById(id)
	if err != nil {
		return err
	}
	if doc == nil {
		return errors.New("document not found")
	}

	var files []repository.File
	for _, val := range doc.Files {
		if val.Name != file {
			files = append(files, val)
		} else {
			go func(val repository.File) {
				fileManager := utils.NewS3Client("", "", "")
				fileKey, ok := fileManager.ExtractFileKeyFromURL(val.Url)
				if ok != nil {
					log.Printf("error extract file key from url %s", val.Url)
				}

				er := fileManager.DeleteFileFromS3(fileKey)
				if er != nil {
					log.Printf("error delete file %s from s3", fileKey)
				}
			}(val)
		}
	}

	err = s.documentRepo.UpdateFiles(id, files)
	if err != nil {
		return err
	}

	return err

}
