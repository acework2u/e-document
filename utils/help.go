package utils

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
	"regexp"
	"time"
)

type ErrorHandler struct {
	ctx *gin.Context
}
type ApiError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func NewErrorHandler(ctx *gin.Context) *ErrorHandler {
	return &ErrorHandler{ctx: ctx}
}

func (c *ErrorHandler) ValidateCustomError(err error) {
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
	case "max":
		return "should be max than " + fe.Param()
	case "number":
		return fmt.Sprintf("Invalid %v", fe.Field())

	}

	return "Unknown error"
}

func TimeInt64ToString(datetime int64) string {

	t := time.Unix(datetime, 0)
	// Format the time to string
	return t.Format(time.RFC3339)
}
func CheckUUID(uuid string) bool {
	// Define the regex pattern
	var uuidRegex = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$`)
	return uuidRegex.MatchString(uuid)
}
