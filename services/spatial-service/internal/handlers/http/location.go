package http

import (
	"encoding/json"
	"spatial-service/internal/dto"
	"spatial-service/internal/services"
	"spatial-service/internal/transports/ws"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type LocationHandler struct {
	locationService *services.LocationService
}

func NewLocationHandler(locationService *services.LocationService) *LocationHandler {
	return &LocationHandler{
		locationService,
	}
}

func (h *LocationHandler) Routes(router *gin.RouterGroup) {
	router.Group("location")
}

func (h *LocationHandler) OnLocationUpdate(c *ws.WsClient, message []byte) {
	var payload dto.UserLocationUpdate
	if err := json.Unmarshal(message, &payload); err != nil {
		zap.L().Error("failed to unmarshal message", zap.Error(err))
		c.EmitError("Invalid payload")
		return
	}

}
