package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Hop struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name      string
	AlphaAcid float64 `gorm:"column:alpha"`
	Notes     string

	Batches []*Batch `gorm:"many2many:batch_fermentable;"`
}

func (u *Hop) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}

type SourceHop struct {
	Name      string
	AlphaAcid float64 `gorm:"column:alpha"`
	Notes     string
}

func (b *SourceHop) TableName() string {
	return "hop"
}
