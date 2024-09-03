package utils

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
)

type errorHandler struct {
	ctx *gin.Context
}
type ApiError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func NewErrorHandler(ctx *gin.Context) *errorHandler {
	return &errorHandler{ctx: ctx}
}

func (c *errorHandler) ValidateCustomError(err error) {

	//if e, ok := err.(validator.ValidationErrors); ok {
	//
	//	output := make([]*ApiError, len(e))
	//	for _, er := range e {
	//		out := &ApiError{
	//			Field:   er.Field(),
	//			Message: getErrorMsg(er),
	//		}
	//		output = append(output, out)
	//	}
	//	c.ctx.AbortWithStatusJSON(400, gin.H{"errors": output})
	//	return
	//}
	//Origin
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		out := make([]ApiError, len(ve))
		for i, fe := range ve {
			out[i] = ApiError{fe.Field(), getErrorMsg(fe)}
		}
		c.ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "errors": out})
		return

	}

}
func getErrorMsg(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "this field is required"
	case "email":
		return "invalid email" + fe.Param()
	case "numeric":
		return "invalid numeric"
	case "lte":
		return "should be less than " + fe.Param()
	case "gte":
		return "should be greater than " + fe.Param()
	case "min":
		return "should be less than " + fe.Param()
	case "number":
		return fmt.Sprintf("Invalid %v", fe.Field())

	}

	return "Unknown error"
}
