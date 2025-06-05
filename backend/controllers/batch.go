package controllers

import (
	"net/http"

	"github.com/austinreadhoff/zym/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AddBatch(c *gin.Context, db *gorm.DB) {
	recipeID := uuid.MustParse(c.Param("id"))
	newBatch := &models.Batch{RecipeID: recipeID, Number: 1}
	db.Create(&newBatch)
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
