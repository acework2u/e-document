package handler

import (
	"github.com/acework2u/e-document/services"
	"github.com/acework2u/e-document/utils"
	"github.com/gin-gonic/gin"
	"log"
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
	form, _ := c.MultipartForm()
	files := form.File["upload[]"]

	//file, err := files[0].Open()
	for _, file := range files {
		log.Println(file.Filename)
		newName, ok := utils.GenerateNewFileName(file.Filename)
		if ok != nil {
			c.JSON(500, gin.H{
				"error": "upload a document error",
			})
			return
		}
		err := c.SaveUploadedFile(file, "./uploads/"+newName)
		if err != nil {
			c.JSON(500, gin.H{
				"error": "upload a document error",
			})
		}
		log.Println(newName)

	}

	c.JSON(200, gin.H{
		"message": "upload a document success this id :" + id,
	})
}
