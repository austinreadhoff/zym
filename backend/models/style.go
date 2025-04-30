package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Style struct {
	ID    uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name  string
	Notes string

	Recipes []Recipe `gorm:"foreignKey:StyleID"`
}

func (u *Style) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}

type SourceStyle struct {
	Name  string
	Notes string
}

func (b *SourceStyle) TableName() string {
	return "style"
}
