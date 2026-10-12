package health

import (
	"spatial-service/internal/platform/httpserver"

	"github.com/labstack/echo/v5"
)

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func RegisterRoutes(r *httpserver.APIRouter, h *Handler) {
	r.Root.GET("/healthz", h.Check)
}

func (h *Handler) Check(c *echo.Context) error {
	return c.JSON(200, map[string]interface{}{
		"status": "ok",
	})
}
