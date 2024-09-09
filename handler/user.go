package handler

import (
	"github.com/acework2u/e-document/services"
	"github.com/acework2u/e-document/utils"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) PostRegister(c *gin.Context) {

	userData := &services.UserServiceImpl{}

	err := c.ShouldBindJSON(&userData)
	if err != nil {
		validate := utils.NewErrorHandler(c)
		validate.ValidateCustomError(err)
		return
	}

	userValidate := validator.New()
	if ok := userValidate.Struct(userData); ok != nil {
		validate := utils.NewErrorHandler(c)
		validate.ValidateCustomError(ok)
		return
	}

	user, err := h.userService.CreateUser(userData)
	if err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(201, gin.H{
		"message": user,
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "a user login success",
	})
}
func (h *UserHandler) Logout(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "a user logout success",
	})
}
func (h *UserHandler) GetUserInfo(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "a user info success",
	})
}
func (h *UserHandler) GetUserList(c *gin.Context) {

	name := "anon"
	_, err := h.userService.ViewUser(name)
	if err != nil {
		c.JSON(404, gin.H{
			"message": "a user not found",
		})
	}
	c.JSON(200, gin.H{
		"message": "a user list success",
	})
}
func (h *UserHandler) UpdateUser(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "a user update success",
	})
}
func (h *UserHandler) DeleteUser(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "a user delete success",
	})
}
