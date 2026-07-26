package models

type User struct {
	Base
	ExternalID string `gorm:"uniqueIndex;not null" json:"external_id"`
	Email      string `gorm:"uniqueIndex"          json:"email"`
	UserName   string `                            json:"user_name"`
	Active     bool   `gorm:"default:true"         json:"is_active"`
}

func (User) TableName() string {
	return "users"
}
