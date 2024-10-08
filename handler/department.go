package handler

import (
	"github.com/acework2u/e-document/services"
	"github.com/acework2u/e-document/utils"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"log"
	"net/http"
)

type DepartmentHandler struct {
	deptService services.DepartmentService
}

func NewDepartmentHandler(deptService services.DepartmentService) *DepartmentHandler {
	return &DepartmentHandler{deptService: deptService}
}

func (h *DepartmentHandler) GetAllDepartment(c *gin.Context) {
	filter := services.Filter{}
	if err := c.ShouldBindQuery(&filter); err != nil {
		valid := utils.NewErrorHandler(c)
		valid.ValidateCustomError(err)
		return
	}
	result, err := h.deptService.GetDepartments(filter)
	if err != nil {
		log.Printf("Failed to get departments: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get departments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": result})
}

func (h *DepartmentHandler) PostCreateDepartment(c *gin.Context) {
	dept := services.Department{}
	if err := c.ShouldBindJSON(&dept); err != nil {
		validate := utils.NewErrorHandler(c)
		validate.ValidateCustomError(err)
		return
	}

	// Create a new validator instance
	validate := validator.New()
	if ok := validate.Struct(dept); ok != nil {
		cusErr := utils.NewErrorHandler(c)
		cusErr.ValidateCustomError(ok)
		return
	}
	result, err := h.deptService.CreateDepartment(&dept)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"result": result})

}

func (h *DepartmentHandler) PutUpdateDepartment(c *gin.Context) {

	data := services.Department{}

	err := c.ShouldBindJSON(&data)

	cusErr := utils.NewErrorHandler(c)
	if err != nil {
		cusErr.ValidateCustomError(err)
		return
	}

	err = h.deptService.UpdateDepartment(&data)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"result": data})

}
