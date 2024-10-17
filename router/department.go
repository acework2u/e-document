package router

import (
	"github.com/acework2u/e-document/handler"
	"github.com/acework2u/e-document/middleware"
	"github.com/gin-gonic/gin"
)

type DepartmentRouter struct {
	deptHandler *handler.DepartmentHandler
}

func NewDepartmentRouter(deptHandler *handler.DepartmentHandler) *DepartmentRouter {
	return &DepartmentRouter{deptHandler: deptHandler}

}

func (r *DepartmentRouter) DepartmentRoute(rg *gin.RouterGroup) {

	router := rg.Group("departments", middleware.Authorization())

	router.GET("", r.deptHandler.GetAllDepartment)
	router.GET("/:id", r.deptHandler.GetDepartmentById)
	router.POST("", middleware.Middleware(r.deptHandler.PostCreateDepartment, middleware.AdminAuthorization))
	router.PUT("", r.deptHandler.PutUpdateDepartment)
}
