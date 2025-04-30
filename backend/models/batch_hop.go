package models

import (
	"time"

	"github.com/google/uuid"
)

type BatchHop struct {
	BatchID     uuid.UUID `gorm:"primaryKey"`
	HopID       uuid.UUID `gorm:"primaryKey"`
	Amount      float64   // assume oz for now, maybe add other units later
	BoilMinutes int64
	DryHop      bool      // Maybe expand for other uses later
	Created     time.Time `gorm:"autoCreateTime"`

	Batch Batch `gorm:"foreignKey:BatchID"`
	Hop   Hop   `gorm:"foreignKey:HopID"`
}

func (b *BatchHop) TableName() string {
	return "batch_hop"
}
