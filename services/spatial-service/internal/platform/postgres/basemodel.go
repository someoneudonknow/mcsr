package postgres

import (
	"time"

	"gorm.io/gorm"
)

type BaseModel struct {
	ID        string         `gorm:"type:uuid;primaryKey;default:uuidv7()" json:"id"`
	CreatedAt time.Time      `                                             json:"created_at"`
	UpdatedAt time.Time      `                                             json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index"                                 json:"-"`
}
