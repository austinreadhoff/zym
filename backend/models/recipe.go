package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Recipe struct {
	ID      uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name    string
	Notes   string
	UserID  uuid.UUID
	StyleID uuid.UUID
	Created time.Time `gorm:"autoCreateTime"`

	User    User
	Style   Style
	Batches []Batch `gorm:"foreignKey:RecipeID"`
}

func (u *Recipe) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
