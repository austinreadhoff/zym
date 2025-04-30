package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Batch struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey"`
	RecipeID uuid.UUID
	Number   int
	OG       float64
	IBU      float64
	Created  time.Time `gorm:"autoCreateTime"`

	Fermentables []*Fermentable `gorm:"many2many:batch_fermentable;"`
	Hops         []*Hop         `gorm:"many2many:batch_hop;"`
	Recipe       Recipe
}

func (u *Batch) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
