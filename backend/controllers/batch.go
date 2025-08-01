package controllers

import (
	"net/http"

	"github.com/austinreadhoff/zym/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AddBatch(c *gin.Context, db *gorm.DB) {
	var body struct {
		RecipeID uuid.UUID `json:"recipeID"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	recipeID := body.RecipeID
	var maxNumber int
	db.Model(&models.Batch{}).
		Where("recipe_id = ?", body.RecipeID).
		Select("COALESCE(MAX(number), 0)").
		Scan(&maxNumber)

	newBatch := &models.Batch{RecipeID: recipeID, Number: maxNumber + 1}
	db.Create(&newBatch)
	c.JSON(http.StatusOK, gin.H{
		"batch": newBatch,
	})
}

func UpdateBatch(c *gin.Context, db *gorm.DB) {
	batchID := uuid.MustParse(c.Param("id"))

	var input models.BatchWithMetaData

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}
	input.ID = batchID

	// Update batch fields
	db.Model(&models.Batch{}).Where("id = ?", batchID).Select("og", "ibu", "notes").Updates(map[string]interface{}{
		"og":    input.OG,
		"ibu":   input.IBU,
		"notes": input.Notes,
	})

	// Hops
	var dbHops []models.BatchHop
	db.Where("batch_id = ?", batchID).Find(&dbHops)
	dbHopMap := make(map[uuid.UUID]models.BatchHop)
	for _, h := range dbHops {
		dbHopMap[h.BatchHopID] = h
	}
	inputHopMap := make(map[uuid.UUID]models.BatchHopWithMetadata)
	for _, h := range input.Hops {
		inputHopMap[h.BatchHopID] = h
	}
	// Delete hops not present in input
	for id := range dbHopMap {
		if _, exists := inputHopMap[id]; !exists {
			db.Delete(&models.BatchHop{}, "batch_hop_id = ?", id)
		}
	}
	// Add or update hops
	for _, h := range input.Hops {
		if h.BatchHopID == uuid.Nil {
			// New hop addition
			newHop := models.BatchHop{
				BatchID:     batchID,
				HopID:       h.Hop.ID,
				AlphaAcid:   h.AlphaAcid,
				Amount:      h.Amount,
				BoilMinutes: h.BoilMinutes,
				DryHop:      h.DryHop,
			}
			db.Create(&newHop)
		} else {
			// Update existing
			db.Model(&models.BatchHop{}).Where("batch_hop_id = ?", h.BatchHopID).Updates(models.BatchHop{
				AlphaAcid:   h.AlphaAcid,
				Amount:      h.Amount,
				BoilMinutes: h.BoilMinutes,
				DryHop:      h.DryHop,
			})
		}
	}

	// Fermentables
	var dbFermentables []models.BatchFermentable
	db.Where("batch_id = ?", batchID).Find(&dbFermentables)
	dbFermMap := make(map[uuid.UUID]models.BatchFermentable)
	for _, f := range dbFermentables {
		dbFermMap[f.BatchFermentableID] = f
	}
	inputFermMap := make(map[uuid.UUID]models.BatchFermentableWithMetadata)
	for _, f := range input.Fermentables {
		inputFermMap[f.BatchFermentableID] = f
	}
	// Delete fermentables not present in input
	for id := range dbFermMap {
		if _, exists := inputFermMap[id]; !exists {
			db.Delete(&models.BatchFermentable{}, "batch_fermentable_id = ?", id)
		}
	}
	// Add or update fermentables
	for _, f := range input.Fermentables {
		if f.BatchFermentableID == uuid.Nil {
			// New fermentable addition
			newFerm := models.BatchFermentable{
				BatchID:       batchID,
				FermentableID: f.Fermentable.ID,
				Percent:       f.Percent,
				Mash:          f.Mash,
			}
			db.Create(&newFerm)
		} else {
			// Update existing
			db.Model(&models.BatchFermentable{}).Where("batch_fermentable_id = ?", f.BatchFermentableID).Updates(models.BatchFermentable{
				Percent: f.Percent,
				Mash:    f.Mash,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{})
}

func DeleteBatch(c *gin.Context, db *gorm.DB) {
	batchID := uuid.MustParse(c.Param("id"))
	db.Delete(&models.Batch{}, batchID)

	c.JSON(http.StatusOK, gin.H{
		"deletedID": batchID,
	})
}
