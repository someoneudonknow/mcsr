package ws

import (
	"bytes"
	"encoding/json"
	"spatial-service/internal/dto"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

type WsClientOptions struct {
	WriteWait      int
	PongWait       int
	MaxMessageSize int64
}

type WsClient struct {
	clientID string
	options  WsClientOptions
	conn     *websocket.Conn
	send     chan []byte
	hub      *Hub
	rooms    map[string]bool
}

var (
	newLine = []byte{'\n'}
	space   = []byte{' '}
)

func NewWsClient(opts WsClientOptions, hub *Hub, send chan []byte, conn *websocket.Conn) *WsClient {
	return &WsClient{
		options:  opts,
		hub:      hub,
		send:     send,
		conn:     conn,
		clientID: uuid.NewString(),
		rooms:    make(map[string]bool),
	}
}

func (c *WsClient) Emit(payload any) {
	message := c.encodePayload(payload)
	select {
	case c.send <- message:
	default:
		zap.L().Warn("client send buffer full, dropping connection")
		c.hub.Unregister(c)
	}
}

func (c *WsClient) EmitError(message string) {
	c.Emit(struct {
		Message string `json:"message"`
	}{
		Message: message,
	})
}

func (c *WsClient) encodePayload(payload any) []byte {
	var message []byte
	var err error

	switch v := payload.(type) {
	case []byte:
		message = v
	case string:
		message = []byte(v)
	default:
		message, err = json.Marshal(v)
		if err != nil {
			zap.L().Error("failed to marshal payload", zap.Error(err))
			return nil
		}
	}

	return message
}

func (c *WsClient) EmitToRoom(roomID string, message any) {
	c.hub.BroadcastToRoom(c, roomID, c.encodePayload(message))
}

func (c *WsClient) JoinRoom(roomID string) {
	c.hub.JoinRoom(roomID, c)
	c.rooms[roomID] = true
}

func (c *WsClient) LeaveRoom(roomID string) {
	c.hub.LeaveRoom(roomID, c)
	delete(c.rooms, roomID)
}

func (c *WsClient) ReadPump() {
	defer func() {
		c.conn.Close()
		c.hub.Unregister(c)
		for roomID := range c.rooms {
			c.hub.LeaveRoom(roomID, c)
		}
	}()

	c.conn.SetReadLimit(c.options.MaxMessageSize)
	// c.conn.SetReadDeadline(time.Now().Add(time.Duration(c.options.PongWait) * time.Second))
	// c.conn.SetPongHandler(func(string) error {
	// 	c.conn.SetReadDeadline(time.Now().Add(time.Duration(c.options.PongWait)))
	// 	return nil
	// })

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			zap.L().Error("failed to read message", zap.Error(err))
			if websocket.IsUnexpectedCloseError(
				err,
				websocket.CloseGoingAway,
				websocket.CloseAbnormalClosure,
			) {
				zap.L().Error("failed to read message", zap.Error(err))
				break
			}
			break
		}

		message = bytes.TrimSpace(bytes.ReplaceAll(message, newLine, space))

		var wsMessage dto.WsMessage

		if err := json.Unmarshal(message, &wsMessage); err != nil {
			zap.L().Error("Invalid message type", zap.Error(err))
			continue
		} else {
			c.hub.ExecuteHandler(wsMessage.Event, c, message)
		}
	}
}

func (c *WsClient) WritePump() {
	pingPeriod := (c.options.PongWait * 9) / 10
	ticker := time.NewTicker(time.Duration(time.Duration(pingPeriod) * time.Second))

	defer func() {
		ticker.Stop()
		c.conn.Close()
		c.hub.Unregister(c)
	}()

	for {
		select {
		case <-ticker.C:
			c.conn.SetWriteDeadline(
				time.Now().Add(time.Duration(time.Duration(c.options.WriteWait) * time.Second)),
			)
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				zap.L().Error("failed to write ping message", zap.Error(err))
				return
			}
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, nil)
				return
			}
			c.conn.WriteMessage(websocket.TextMessage, message)
		}
	}
}
