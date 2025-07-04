package controllers

import (
	"net/http"

	"github.com/austinreadhoff/zym/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetRecipes(c *gin.Context, db *gorm.DB) {
	userID := c.MustGet("userid").(string)
	var recipes []models.Recipe
	db.Joins("Style").Where("user_id = ?", userID).Find(&recipes)

	c.JSON(http.StatusOK, gin.H{
		"recipes": recipes,
	})
}

func GetRecipe(c *gin.Context, db *gorm.DB) {
	recipeID := c.Param("id")

	var recipe models.Recipe
	db.First(&recipe, "id = ?", recipeID)

	var batches []models.Batch
	db.Where("recipe_id = ?", recipe.ID).Find(&batches)

	var batchResponses []models.BatchWithMetaData

	for _, batch := range batches {
		var batchHops []models.BatchHop
		db.Where("batch_id = ?", batch.ID).Find(&batchHops)

		hopsWithAmount := make([]models.BatchHopWithMetadata, 0, len(batchHops))
		for _, bh := range batchHops {
			var hop models.Hop
			db.First(&hop, "id = ?", bh.HopID)
			hopsWithAmount = append(hopsWithAmount, models.BatchHopWithMetadata{
				BatchHopID:  bh.BatchHopID,
				Hop:         hop,
				Amount:      bh.Amount,
				BoilMinutes: bh.BoilMinutes,
				DryHop:      bh.DryHop,
			})
		}

		var batchFermentables []models.BatchFermentable
		db.Where("batch_id = ?", batch.ID).Find(&batchFermentables)

		fermentablesWithAmount := make([]models.BatchFermentableWithMetadata, 0, len(batchFermentables))
		for _, bf := range batchFermentables {
			var ferm models.Fermentable
			db.First(&ferm, "id = ?", bf.FermentableID)
			fermentablesWithAmount = append(fermentablesWithAmount, models.BatchFermentableWithMetadata{
				BatchFermentableID: bf.BatchFermentableID,
				Fermentable:        ferm,
				Amount:             bf.Amount,
			})
		}

		batchResponses = append(batchResponses, models.BatchWithMetaData{
			Batch:        batch,
			Hops:         hopsWithAmount,
			Fermentables: fermentablesWithAmount,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"recipe":  recipe,
		"batches": batchResponses,
	})
}

func AddRecipe(c *gin.Context, db *gorm.DB) {
	userID := uuid.MustParse(c.MustGet("userid").(string))

	newRecipe := &models.Recipe{Name: "New Recipe", UserID: userID}
	db.Create(&newRecipe)

	newBatch := &models.Batch{RecipeID: newRecipe.ID, Number: 1}
	db.Create(&newBatch)

	c.JSON(http.StatusOK, gin.H{
		"id": newRecipe.ID,
	})
}

func UpdateRecipe(c *gin.Context, db *gorm.DB) {
	recipeID := uuid.MustParse(c.Param("id"))
	userID := uuid.MustParse(c.MustGet("userid").(string))

	var input models.Recipe
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}
	input.ID = recipeID
	input.UserID = userID

	db.Save(input)

	c.JSON(http.StatusOK, gin.H{})
}

func DeleteRecipe(c *gin.Context, db *gorm.DB) {
	recipeID := uuid.MustParse(c.Param("id"))

	db.Where("recipe_id = ?", recipeID).Delete(&models.Batch{})
	db.Delete(&models.Recipe{}, recipeID)

	c.JSON(http.StatusOK, gin.H{
		"deletedID": recipeID,
	})
}
