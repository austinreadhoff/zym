package models

import (
	"github.com/google/uuid"
)

// Represents Batches with all associated Hop and Fermentable information as passed to/from the frontend

type BatchHopWithMetadata struct {
	Hop
	BatchHopID  uuid.UUID
	Amount      float64
	BoilMinutes int64
	DryHop      bool
}
type BatchFermentableWithMetadata struct {
	Fermentable
	BatchFermentableID uuid.UUID
	Amount             float64
}
type BatchWithMetaData struct {
	Batch
	Hops         []BatchHopWithMetadata
	Fermentables []BatchFermentableWithMetadata
}
