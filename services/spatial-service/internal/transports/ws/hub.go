package ws

import (
	"encoding/json"
	"spatial-service/internal/types"

	"go.uber.org/zap"
)

type RoomMessage struct {
	roomID  string
	message []byte
}

type Hub struct {
	clients         map[*WsClient]bool
	register        chan *WsClient
	unregister      chan *WsClient
	broadcast       chan []byte
	broadcastToRoom chan RoomMessage
	rooms           map[string]map[*WsClient]bool
	handlers        map[types.WsEvent]func(c *WsClient, message []byte)
}

func NewHub() *Hub {
	return &Hub{
		clients:         make(map[*WsClient]bool),
		register:        make(chan *WsClient),
		unregister:      make(chan *WsClient),
		broadcast:       make(chan []byte),
		broadcastToRoom: make(chan RoomMessage),
		rooms:           make(map[string]map[*WsClient]bool),
		handlers:        make(map[types.WsEvent]func(c *WsClient, message []byte)),
	}
}

func (h *Hub) Register(client *WsClient) {
	h.register <- client
}

func (h *Hub) Unregister(client *WsClient) {
	h.unregister <- client
}

func (h *Hub) Broadcast(message []byte) {
	zap.L().Info("broadcasting message", zap.String("message", string(message)))
	h.broadcast <- message
}

func (h *Hub) JoinRoom(roomID string, c *WsClient) {
	if _, ok := h.rooms[roomID]; !ok {
		h.rooms[roomID] = make(map[*WsClient]bool)
	}
	h.rooms[roomID][c] = true
}

func (h *Hub) LeaveRoom(roomID string, c *WsClient) {
	if client, ok := h.rooms[roomID]; ok {
		delete(client, c)
		if len(client) == 0 {
			delete(h.rooms, roomID)
		}
	}
}

func (h *Hub) BroadcastToRoom(c *WsClient, roomID string, message []byte) {
	h.broadcastToRoom <- RoomMessage{
		roomID:  roomID,
		message: message,
	}
}

func (h *Hub) On(event types.WsEvent, handler func(c *WsClient, message []byte)) {
	h.handlers[event] = handler
}

func (h *Hub) ExecuteHandler(event types.WsEvent, c *WsClient, message []byte) {
	if _, ok := h.handlers[event]; !ok {
		zap.L().Error("handler not found", zap.String("event", string(event)))
		return
	}
	h.handlers[event](c, message)
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case roomMessage := <-h.broadcastToRoom:
			if clients, ok := h.rooms[roomMessage.roomID]; ok {
				for client := range clients {
					select {
					case client.send <- roomMessage.message:
					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
		case message := <-h.broadcast:
			messageBytes, err := json.Marshal(message)
			if err != nil {
				zap.L().Error("failed to marshal message", zap.Error(err))
				continue
			}
			for client := range h.clients {
				select {
				case client.send <- messageBytes:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
