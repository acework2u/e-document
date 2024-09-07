package handler

import (
	"github.com/acework2u/e-document/services"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) Register(c *gin.Context) {

	c.JSON(200, gin.H{
		"message": "a user register success",
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
	_, err := h.userService.GetUser(name)
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
