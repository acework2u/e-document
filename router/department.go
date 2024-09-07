package router

import (
	"github.com/acework2u/e-document/handler"
	"github.com/gin-gonic/gin"
)

type DepartmentRouter struct {
	deptHandler *handler.DepartmentHandler
}

func NewDepartmentRouter(deptHandler *handler.DepartmentHandler) *DepartmentRouter {
	return &DepartmentRouter{deptHandler: deptHandler}

}

func (r *DepartmentRouter) DepartmentRoute(rg *gin.RouterGroup) {

	router := rg.Group("departments")

	router.GET("", r.deptHandler.GetAllDepartment)
	router.POST("", r.deptHandler.PostCreateDepartment)
	router.PUT("", r.deptHandler.PutUpdateDepartment)
}
