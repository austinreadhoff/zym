package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BatchHop struct {
	gorm.Model
	BatchID     uuid.UUID `gorm:"primaryKey"`
	HopID       uuid.UUID `gorm:"primaryKey"`
	Amount      float64   // assume oz for now, maybe add other units later
	BoilMinutes int64
	DryHop      bool // Maybe expand for other uses later

	Batch Batch `gorm:"foreignKey:BatchID"`
	Hop   Hop   `gorm:"foreignKey:HopID"`
}

func (b *BatchHop) TableName() string {
	return "batch_hop"
}
