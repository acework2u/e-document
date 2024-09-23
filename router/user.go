package router

import (
	"github.com/acework2u/e-document/conf"
	"github.com/acework2u/e-document/handler"
	"github.com/acework2u/e-document/middleware"
	"github.com/gin-gonic/gin"
)

type UserRouter struct {
	userHandler *handler.UserHandler
	conf        *conf.AppConf
}

func NewUserRouter(userHandler *handler.UserHandler, appConf *conf.AppConf) *UserRouter {
	return &UserRouter{
		userHandler: userHandler,
		conf:        appConf,
	}

}

func (r *UserRouter) UserRoute(rg *gin.RouterGroup) {
	router := rg.Group("users")

	secretKey := []byte(r.conf.App.SecretKey)

	router.GET("", r.userHandler.GetUserList)
	router.GET("/:uid", r.userHandler.GetUserInfo)
	router.POST("", r.userHandler.PostRegister)
	router.POST("/signin", r.userHandler.PostUserSignIn)
	router.POST("/changepassword", middleware.Authorization(secretKey), r.userHandler.PostUserChangePassword)
	router.PUT("", r.userHandler.PutUpdateUser)
	router.DELETE("/:uid", r.userHandler.DeleteUser)

}
