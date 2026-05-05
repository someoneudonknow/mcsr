package ws

import (
	"net/http"
	"slices"
	"spatial-service/pkg/config"
	"spatial-service/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WsHandler struct {
	config *config.WSConfig
	hub    *Hub
}

func NewWsHandler(cfg config.WSConfig, hub *Hub) *WsHandler {
	return &WsHandler{config: &cfg, hub: hub}
}

func (ws *WsHandler) Routes(router *gin.RouterGroup) {
	router.GET("", ws.ServeWs)
}

func (ws *WsHandler) Upgrader() *websocket.Upgrader {
	return &websocket.Upgrader{
		ReadBufferSize:  ws.config.ReadBufferSize,
		WriteBufferSize: ws.config.WriteBufferSize,
		CheckOrigin: func(r *http.Request) bool {
			if len(ws.config.Origins) == 0 || (ws.config.Origins[0] == "*") {
				return true
			}
			origin := r.Header.Get("Origin")
			return slices.Contains(ws.config.Origins, origin)
		},
	}
}

func (ws *WsHandler) ServeWs(c *gin.Context) {
	conn, err := ws.Upgrader().Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		response.JSONError(
			c,
			"failed to upgrade websocket connection",
			http.StatusInternalServerError,
			err,
		)
	}
	client := NewWsClient(WsClientOptions{
		MaxMessageSize: int64(ws.config.MaxMessageSize),
		WriteWait:      ws.config.WriteWait,
		PongWait:       ws.config.PongWait,
	}, ws.hub, make(chan []byte, 256), conn)

	ws.hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}
