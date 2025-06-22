package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BatchFermentable struct {
	BatchFermentableID uuid.UUID `gorm:"primaryKey"`
	BatchID            uuid.UUID
	FermentableID      uuid.UUID
	Amount             float64   // assume oz for now, maybe add other units later
	Created            time.Time `gorm:"autoCreateTime"`

	Batch       Batch       `gorm:"foreignKey:BatchID"`
	Fermentable Fermentable `gorm:"foreignKey:FermentableID"`
}

func (u *BatchFermentable) BeforeCreate(tx *gorm.DB) (err error) {
	if u.BatchFermentableID != uuid.Nil {
		return
	}

	u.BatchFermentableID = uuid.New()
	return
}

func (b *BatchFermentable) TableName() string {
	return "batch_fermentable"
}
