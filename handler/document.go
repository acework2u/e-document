package handler

import (
	"github.com/acework2u/e-document/services"
	"github.com/gin-gonic/gin"
)

type DocumentHandler struct {
	docService services.DocumentService
}

func NewDocument(docService services.DocumentService) *DocumentHandler {
	return &DocumentHandler{docService: docService}
}

func (h *DocumentHandler) CreateDocument(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "success",
	})
}
func (h *DocumentHandler) GetDocument(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "get a document success",
	})
}
func (h *DocumentHandler) UpdateDocument(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "update a document success",
	})
}
func (h *DocumentHandler) DeleteDocument(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "delete a document success",
	})
}
func (h *DocumentHandler) ListDocument(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "list a document success",
	})
}
