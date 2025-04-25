package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Recipe struct {
	gorm.Model
	ID      uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name    string
	UserID  uuid.UUID
	StyleID uuid.UUID

	User    User
	Style   Style
	Batches []Batch `gorm:"foreignKey:RecipeID"`
}

func (u *Recipe) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
