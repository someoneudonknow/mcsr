package response

import (
	"github.com/gin-gonic/gin"
)

type Response[T any] struct {
	Message  string `json:"message"`
	Metadata T      `json:"metadata,omitempty"`
	Code     int    `json:"code,omitempty"`
	Success  bool   `json:"success"`
}

type ErrorResponse struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
	Details any    `json:"details,omitempty"`
}

type WSErrorResponse struct {
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

func JSONSuccess[T any](c *gin.Context, status int, message string, metadata T) {
	c.JSON(status, Response[T]{
		Message:  message,
		Metadata: metadata,
		Code:     status,
		Success:  true,
	})
}

func JSONError(c *gin.Context, message string, code int, details any) {
	c.JSON(code, ErrorResponse{
		Message: message,
		Code:    code,
		Details: details,
	})
}
