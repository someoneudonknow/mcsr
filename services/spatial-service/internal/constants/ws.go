package constants

import "spatial-service/internal/types"

const (
	WS_NOTI_TYPE_ROOM types.WsNotiType = iota
	WS_NOTI_TYPE_BROADCAST
)

const (
	WS_EVENT_LOCATION_UPDATE types.WsEvent = "location_update"
)
