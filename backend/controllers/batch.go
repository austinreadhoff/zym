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

	db.Model(&models.Batch{}).Where("id = ?", batchID).Select("og", "ibu", "notes").Updates(map[string]interface{}{
		"og":    input.OG,
		"ibu":   input.IBU,
		"notes": input.Notes,
	})

	// Hops
	var dbHops []models.BatchHop
	db.Where("batch_id = ?", batchID).Find(&dbHops)
	inputHopIDs := make(map[uuid.UUID]models.BatchHop)
	for _, h := range input.Hops {
		inputHopIDs[h.ID] = models.BatchHop{
			BatchID:     batchID,
			HopID:       h.ID,
			Amount:      h.Amount,
			BoilMinutes: h.BoilMinutes,
			DryHop:      h.DryHop,
		}
	}
	dbHopIDs := make(map[uuid.UUID]models.BatchHop)
	for _, h := range dbHops {
		dbHopIDs[h.HopID] = h
	}
	// Delete
	for id := range dbHopIDs {
		if _, exists := inputHopIDs[id]; !exists {
			db.Where("batch_id = ? AND hop_id = ?", batchID, id).Delete(&models.BatchHop{})
		}
	}
	// Add/Update
	for id, h := range inputHopIDs {
		if _, exists := dbHopIDs[id]; !exists {
			db.Create(&h)
		} else {
			db.Model(&models.BatchHop{}).Where("batch_id = ? AND hop_id = ?", batchID, id).Updates(h)
		}
	}

	// Fermentables
	var dbFermentables []models.BatchFermentable
	db.Where("batch_id = ?", batchID).Find(&dbFermentables)
	inputFermIDs := make(map[uuid.UUID]models.BatchFermentable)
	for _, f := range input.Fermentables {
		inputFermIDs[f.ID] = models.BatchFermentable{
			BatchID:       batchID,
			FermentableID: f.ID,
			Amount:        f.Amount,
		}
	}
	dbFermIDs := make(map[uuid.UUID]models.BatchFermentable)
	for _, f := range dbFermentables {
		dbFermIDs[f.FermentableID] = f
	}
	// Delete
	for id := range dbFermIDs {
		if _, exists := inputFermIDs[id]; !exists {
			db.Where("batch_id = ? AND fermentable_id = ?", batchID, id).Delete(&models.BatchFermentable{})
		}
	}
	// Add/Update
	for id, f := range inputFermIDs {
		if _, exists := dbFermIDs[id]; !exists {
			// Add new
			db.Create(&f)
		} else {
			// Update existing
			db.Model(&models.BatchFermentable{}).Where("batch_id = ? AND fermentable_id = ?", batchID, id).Updates(f)
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
