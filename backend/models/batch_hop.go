package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BatchHop struct {
	BatchHopID  uuid.UUID `gorm:"primaryKey"`
	BatchID     uuid.UUID
	HopID       uuid.UUID
	Amount      float64 // assume oz for now, maybe add other units later
	BoilMinutes int64
	DryHop      bool      // Maybe expand for other uses later
	Created     time.Time `gorm:"autoCreateTime"`

	Batch Batch `gorm:"foreignKey:BatchID"`
	Hop   Hop   `gorm:"foreignKey:HopID"`
}

func (u *BatchHop) BeforeCreate(tx *gorm.DB) (err error) {
	if u.BatchHopID != uuid.Nil {
		return
	}

	u.BatchHopID = uuid.New()
	return
}

func (b *BatchHop) TableName() string {
	return "batch_hop"
}
