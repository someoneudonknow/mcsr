package response

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
	Meta    any    `json:"meta,omitempty"`
}

func NoContent(c *echo.Context) error {
	return c.NoContent(http.StatusNoContent)
}

func Created(c *echo.Context, message string, data any) error {
	return c.JSON(http.StatusCreated, SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func CreatedWithMeta(c *echo.Context, message string, data any, meta any) error {
	return c.JSON(http.StatusCreated, SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
		Meta:    meta,
	})
}

func OK(c *echo.Context, message string, data any) error {
	return c.JSON(http.StatusOK, SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

func OKWithMeta(c *echo.Context, message string, data any, meta any) error {
	return c.JSON(http.StatusOK, SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
		Meta:    meta,
	})
}
