package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BatchFermentable struct {
	gorm.Model
	BatchID       uuid.UUID `gorm:"primaryKey"`
	FermentableID uuid.UUID `gorm:"primaryKey"`
	Amount        float64   // assume oz for now, maybe add other units later

	Batch       Batch       `gorm:"foreignKey:BatchID"`
	Fermentable Fermentable `gorm:"foreignKey:FermentableID"`
}

func (b *BatchFermentable) TableName() string {
	return "batch_fermentable"
}
