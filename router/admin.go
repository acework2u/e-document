package router

import (
	"github.com/acework2u/e-document/handler"
	"github.com/gin-gonic/gin"
)

type AdminRouter struct {
	adminHandler *handler.AdminHandler
}

func NewAdminRouter(adminHandler *handler.AdminHandler) *AdminRouter {
	return &AdminRouter{
		adminHandler: adminHandler,
	}
}

func (r *AdminRouter) AdminRoute(rg *gin.RouterGroup) {
	routers := rg.Group("/admin")

	_ = routers
}
