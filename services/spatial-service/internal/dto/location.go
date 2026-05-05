package dto

type UserLocationUpdate struct {
	UserID string  `json:"user_id"`
	Long   float64 `json:"longitude"`
	Lat    float64 `json:"latitude"`
}
