package handler

import (
	"github.com/acework2u/e-document/services"
	"github.com/acework2u/e-document/utils"
	"github.com/gin-gonic/gin"
)

type DocumentHandler struct {
	docService services.DocumentService
}

func NewDocument(docService services.DocumentService) *DocumentHandler {
	return &DocumentHandler{docService: docService}
}

func (h *DocumentHandler) CreateDocument(c *gin.Context) {
	documentImpl := services.DocumentImpl{}
	userID, _ := c.Get("userid")

	userDepartment, _ := c.Get("userDepartment")

	//log.Printf("userID:%v", userID)
	//log.Printf("userDepartment:%v", userDepartment)

	err := c.ShouldBind(&documentImpl)
	if err != nil {
		cusErr := utils.NewErrorHandler(c)
		cusErr.ValidateCustomError(err)
		return
	}

	documentImpl.DepartmentCode = userDepartment.(string)
	documentImpl.ReceivedBy = userID.(string)

	err = h.docService.CreateDocument(documentImpl)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message": documentImpl,
	})
}
func (h *DocumentHandler) GetDocument(c *gin.Context) {

	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{
			"error": "id is empty",
		})
		return
	}

	result, err := h.docService.GetDocument(id)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "get a document error",
		})
		return
	}

	c.JSON(200, gin.H{
		"message": result,
	})
}
func (h *DocumentHandler) UpdateDocument(c *gin.Context) {
	documentImpl := services.DocumentImpl{}
	err := c.ShouldBind(&documentImpl)
	if err != nil {
		cusErr := utils.NewErrorHandler(c)
		cusErr.ValidateCustomError(err)
		return
	}

	userID, _ := c.Get("userid")
	documentImpl.ReceivedBy = userID.(string)

	err = h.docService.UpdateDocument(documentImpl.ID, documentImpl)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "update a document success",
	})
}
func (h *DocumentHandler) DeleteDocument(c *gin.Context) {

	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{
			"error": "id is empty",
		})
	}

	err := h.docService.DeleteDocument(id)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "delete a document error",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "delete a document success id :" + id,
	})
}
func (h *DocumentHandler) ListDocument(c *gin.Context) {

	filter := services.Filter{}
	if err := c.ShouldBindQuery(&filter); err != nil {
		validate := utils.NewErrorHandler(c)
		validate.ValidateCustomError(err)
		return
	}
	// Document result
	result, err := h.docService.GetDocuments(filter)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "list a document error",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": result,
	})
}
func (h *DocumentHandler) UploadDocument(c *gin.Context) {
	// 67034452a93b7f9e779a7c23

	id := c.Param("id")
	if id == "" {
		c.JSON(400, gin.H{
			"error": "id is empty",
		})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	// upload multi file
	//files := form.File["uploads[]"]
	err = h.docService.UploadFile(id, form)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	/*
		for _, file := range files {
			// Open the uploaded file
			f, err := file.Open()
			if err != nil {
				c.JSON(500, gin.H{
					"error": "upload a document error",
				})
				return
			}
			defer f.Close()

			newFileName := utils.GenerateNewFileName(file.Filename)
			log.Printf("newFileName:%v", newFileName)

			uploader := utils.NewS3Client("", "", "")
			fileUrl, err := uploader.UploadFileToS3(newFileName, f)
			if err != nil {
				c.JSON(500, gin.H{
					"error": "upload a document error",
				})
				return
			}
			fileInfo := map[string]interface{}{
				"originalName": file.Filename,
				"s3Url":        fileUrl,
				"uploadedAt":   time.Now(),
			}

			log.Printf("file name:%v", fileInfo)

			// Upload to s3
		}
	*/
	c.JSON(200, gin.H{
		"message": "upload files to document success id" + id,
	})
}
func (h *DocumentHandler) DownloadDocument(c *gin.Context) {
	docId := c.Param("id")
	userId, _ := c.Get("userid")
	if docId == "" {
		c.JSON(400, gin.H{
			"error": "id is empty",
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "download a document success id :" + docId + " userId:" + userId.(string),
	})
}
func (h *DocumentHandler) DeleteFileDocument(c *gin.Context) {

	id := c.Param("id")
	fileName := services.DelFileInput{}
	err := c.ShouldBind(&fileName)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	err = utils.NewS3Client("", "", "").DeleteFileFromS3(fileName.File)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "delete a file of document success id :" + id + " file name:" + fileName.File,
	})
}
func (h *DocumentHandler) UpdateFileDocument(c *gin.Context) {
	id := c.Param("id")
	userId := c.Param("userId")

	c.JSON(200, gin.H{
		"message": "update a file of document success id :" + id + " userId:" + userId,
	})
}
