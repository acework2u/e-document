package handler

import (
	"github.com/acework2u/e-document/services"
	"github.com/acework2u/e-document/utils"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type DepartmentHandler struct {
	deptService services.DepartmentService
}

func NewDepartmentHandler(deptService services.DepartmentService) *DepartmentHandler {
	return &DepartmentHandler{deptService: deptService}
}

func (h *DepartmentHandler) GetAllDepartment(c *gin.Context) {

	filter := services.Filter{}

	err := c.ShouldBindQuery(&filter)

	valid := utils.NewErrorHandler(c)

	if err != nil {
		valid.ValidateCustomError(err)
		return
	}

	result, err := h.deptService.GetDepartments(filter)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"result": result})

}

func (h *DepartmentHandler) PostCreateDepartment(c *gin.Context) {
	dept := services.Department{}
	err := c.ShouldBindJSON(&dept)
	valid := utils.NewErrorHandler(c)

	// Create a new validator instance
	validate := validator.New()
	err = validate.Struct(dept)

	if err != nil {
		valid.ValidateCustomError(err)
		//c.JSON(400, gin.H{"error": err.Error()})
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
