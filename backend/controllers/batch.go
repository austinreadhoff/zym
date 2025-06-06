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

	var input models.Batch
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}
	input.ID = batchID

	db.Save(input)

	c.JSON(http.StatusOK, gin.H{})
}

func DeleteBatch(c *gin.Context, db *gorm.DB) {
	batchID := uuid.MustParse(c.Param("id"))
	db.Delete(&models.Batch{}, batchID)

	c.JSON(http.StatusOK, gin.H{
		"deletedID": batchID,
	})
}
