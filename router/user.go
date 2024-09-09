package router

import (
	"github.com/acework2u/e-document/handler"
	"github.com/gin-gonic/gin"
)

type UserRouter struct {
	userHandler *handler.UserHandler
}

func NewUserRouter(userHandler *handler.UserHandler) *UserRouter {
	return &UserRouter{
		userHandler: userHandler,
	}

}

func (r *UserRouter) UserRoute(rg *gin.RouterGroup) {
	router := rg.Group("users")

	router.GET("", r.userHandler.GetUserList)
	router.POST("", r.userHandler.PostRegister)

}
