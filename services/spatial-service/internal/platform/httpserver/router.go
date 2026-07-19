package httpserver

import (
	"spatial-service/internal/config"

	"github.com/labstack/echo/v5"
)

type APIRouter struct {
	Root           *echo.Group
	RootWithPrefix *echo.Group
	V1             *echo.Group
}

func NewAPIRouter(e *echo.Echo, cfg *config.Config) *APIRouter {
	return &APIRouter{
		Root:           e.Group(""),
		RootWithPrefix: e.Group(cfg.Server.APIPrefix),
		V1:             e.Group(cfg.Server.APIPrefix + "/v1"),
	}
}
