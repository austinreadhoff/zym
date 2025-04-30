package models

import (
	"time"

	"github.com/google/uuid"
)

type BatchFermentable struct {
	BatchID       uuid.UUID `gorm:"primaryKey"`
	FermentableID uuid.UUID `gorm:"primaryKey"`
	Amount        float64   // assume oz for now, maybe add other units later
	Created       time.Time `gorm:"autoCreateTime"`

	Batch       Batch       `gorm:"foreignKey:BatchID"`
	Fermentable Fermentable `gorm:"foreignKey:FermentableID"`
}

func (b *BatchFermentable) TableName() string {
	return "batch_fermentable"
}
