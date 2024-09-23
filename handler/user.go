package handler

import (
	"fmt"
	"github.com/acework2u/e-document/services"
	"github.com/acework2u/e-document/utils"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"log"
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
	userId := c.Param("uid")
	if userId == "" {
		c.JSON(400, gin.H{
			"error": "user id is empty",
		})
		return
	}
	result, err := h.userService.ViewUser(userId)
	if err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(200, gin.H{
		"message": result,
	})
}
func (h *UserHandler) GetUserList(c *gin.Context) {
	filter := services.Filter{}
	if err := c.ShouldBindQuery(&filter); err != nil {
		validate := utils.NewErrorHandler(c)
		validate.ValidateCustomError(err)
		return
	}

	result, err := h.userService.ListUser(filter)
	if err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}
	// Success
	c.JSON(200, gin.H{
		"message": result,
	})

}
func (h *UserHandler) PutUpdateUser(c *gin.Context) {
	userInfo := &services.UserUpdateService{}
	err := c.ShouldBindJSON(userInfo)
	if err != nil {
		invalidParam := utils.NewErrorHandler(c)
		invalidParam.ValidateCustomError(err)
		return
	}

	//Validate the user input
	userValidate := validator.New()
	if ok := userValidate.Struct(userInfo); ok != nil {
		validate := utils.NewErrorHandler(c)
		validate.ValidateCustomError(ok)
		return
	}
	// Call the UpdateUser service method to update the user information
	err = h.userService.UpdateUser(userInfo)
	if err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "User updated successfully",
	})

}
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userId := c.Param("uid")
	err := h.userService.DeleteUser(userId)
	if err != nil {
		c.JSON(400, gin.H{
			"error": "user delete fail",
		})
		return
	}

	delMsg := fmt.Sprintf("user id: %s delete success", userId)
	c.JSON(200, gin.H{
		"message": delMsg,
	})
}
func (h *UserHandler) PostUserSignIn(c *gin.Context) {
	userAuthReq := services.UserAuthenticationImpl{}
	err := c.ShouldBindJSON(&userAuthReq)
	if err != nil {
		invalidParam := utils.NewErrorHandler(c)
		invalidParam.ValidateCustomError(err)
		return
	}
	authResponse, err := h.userService.SignIn(&userAuthReq)
	if err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message": authResponse,
	})

}
func (h *UserHandler) PostUserChangePassword(c *gin.Context) {
	passwordReset := services.PasswordReset{}
	userID := c.GetString("uid")
	_ = userID
	sub := c.GetString("sub")
	userClaims, _ := c.Get("claims")
	ucl := userClaims.(jwt.Claims)

	exp, _ := ucl.GetExpirationTime()
	log.Printf("expired Date: %v", exp)

	if sub == "" {
		c.JSON(400, gin.H{
			"error": "user id is empty",
		})
	}

	err := c.ShouldBindJSON(&passwordReset)
	if err != nil {
		cusErr := utils.NewErrorHandler(c)
		cusErr.ValidateCustomError(err)
		return
	}
	result := fmt.Sprintf("user id: %s change password success", sub)

	c.JSON(200, gin.H{
		"message": result,
	})

}
