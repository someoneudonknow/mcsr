package models

import (
	"time"

	"gorm.io/gorm"
)

// Make this unexported so atlas not generate create table command for it
type Base struct {
	ID        string         `gorm:"type:uuid;primaryKey;default:uuidv7()" json:"id"`
	CreatedAt time.Time      `                                             json:"created_at"`
	UpdatedAt time.Time      `                                             json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index"                                 json:"-"`
}
