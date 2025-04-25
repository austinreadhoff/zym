package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Fermentable struct {
	gorm.Model
	ID    uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name  string
	Yield float64
	Color float64
	Mash  bool
	Notes string

	Batches []*Batch `gorm:"many2many:batch_fermentable;"`
}

func (u *Fermentable) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}

type SourceFermentable struct {
	Name  string
	Yield float64 `gorm:"column:fine_grind_yield_pct"`
	Color float64
	Mash  bool `gorm:"column:recommend_mash"`
	Notes string
}

func (b *SourceFermentable) TableName() string {
	return "fermentable"
}
