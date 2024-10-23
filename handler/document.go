package handler

import (
	"fmt"
	"github.com/acework2u/e-document/services"
	"github.com/acework2u/e-document/utils"
	"github.com/gin-gonic/gin"
	"time"
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
	department, _ := c.Get("userDepartment")
	fmt.Println(department)

	documentImpl.ReceivedBy = userID.(string)
	documentImpl.DepartmentCode = department.(string)

	err = h.docService.UpdateDocument(documentImpl.ID, documentImpl)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	responseTxt := fmt.Sprintf("Document updated successfully")

	c.JSON(200, gin.H{
		"message": responseTxt,
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

	userRole, _ := c.Get("userRole")
	userDepartment, _ := c.Get("userDepartment")
	//
	//fmt.Println("In document handler list document")
	//fmt.Println(userDepartment)
	//fmt.Println(userRole)

	if userRole != nil {
		userRole = userRole.(string)

		if userRole == "admin" || userRole == "1" {

			filter.Department = ""

		} else if userRole == "manager" || userRole == "2" {
			if userDepartment != nil {
				filter.Department = userDepartment.(string)
			}
		}

	}

	// Document result
	result, total, err := h.docService.GetDocuments(filter)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "list a document error",
		})
		return
	}
	documentReturn := map[string]interface{}{
		"total": total,
		"data":  result,
	}

	c.JSON(200, gin.H{
		"message": documentReturn,
	})
}
func (h *DocumentHandler) UploadFileDocument(c *gin.Context) {
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
	//userId, _ := c.Get("userid")
	urlFile := c.Query("url")
	if docId == "" {
		c.JSON(400, gin.H{
			"error": "id is empty",
		})
		return
	}
	if urlFile == "" {
		c.JSON(400, gin.H{
			"error": "url is empty",
		})
		return
	}
	uploader := utils.NewS3Client("", "", "")
	urlFile, err := uploader.ExtractFileKeyFromURL(urlFile)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	downloadUrl, err := uploader.GetFile(urlFile, 15*time.Minute)
	if err != nil {
		c.JSON(500, gin.H{
			"error": "download file error",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": downloadUrl,
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

	err = h.docService.DeleteFile(id, fileName.FileName)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err,
		})
		return
	}

	responseDelete := fmt.Sprintf("delete file %s success", fileName.FileName)
	// delete a file success
	c.JSON(200, gin.H{
		"message": responseDelete,
	})

}
func (h *DocumentHandler) UpdateFileDocument(c *gin.Context) {
	id := c.Param("id")
	userId := c.Param("userId")

	c.JSON(200, gin.H{
		"message": "update a file of document success id :" + id + " userId:" + userId,
	})
}
func (h *DocumentHandler) GetFileDocument(c *gin.Context) {
	id := c.Param("id")
	filters := services.Filter{}
	if err := c.ShouldBindQuery(&filters); err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}
	if id == "" {
		c.JSON(400, gin.H{
			"error": "id is empty",
		})
		return
	}
	files, err := h.docService.GetFiles(id, filters)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"message": files,
	})
}
