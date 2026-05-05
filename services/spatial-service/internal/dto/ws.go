package dto

import "spatial-service/internal/types"

type WsMessage struct {
	NotiType types.WsNotiType `json:"noti_type"`
	RoomID   string           `json:"room_id,omitempty"`
	Event    types.WsEvent    `json:"event"`
	Payload  any              `json:"payload"`
}
