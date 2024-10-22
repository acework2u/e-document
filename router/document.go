package router

import (
	"github.com/acework2u/e-document/handler"
	"github.com/acework2u/e-document/middleware"
	"github.com/gin-gonic/gin"
)

type DocumentRouter struct {
	documentHandler *handler.DocumentHandler
}

func NewDocumentRouter(documentHandler *handler.DocumentHandler) *DocumentRouter {
	return &DocumentRouter{
		documentHandler: documentHandler,
	}
}
func (r *DocumentRouter) DocumentRoute(rg *gin.RouterGroup) {

	router := rg.Group("documents", middleware.Authorization())

	//router.GET("", r.documentHandler.ListDocument)
	router.GET("", middleware.Middleware(r.documentHandler.ListDocument, middleware.EditorAuthorization))
	router.GET("/:id", middleware.Middleware(r.documentHandler.GetDocument, middleware.EditorAuthorization))
	router.POST("/", r.documentHandler.CreateDocument)
	router.PUT("", r.documentHandler.UpdateDocument)
	router.DELETE("/:id", r.documentHandler.DeleteDocument)
	router.POST("/files/:id", middleware.Middleware(r.documentHandler.UploadFileDocument))
	router.DELETE("/:id/files", middleware.Middleware(r.documentHandler.DeleteFileDocument, middleware.EditorAuthorization))
	router.GET("/:id/files", middleware.Middleware(r.documentHandler.GetFileDocument, middleware.EditorAuthorization))
	router.GET("/:id/files/download", middleware.Middleware(r.documentHandler.DownloadDocument, middleware.EditorAuthorization))

}
