package handler

import "github.com/gin-gonic/gin"

type UserHandler struct {
}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
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
