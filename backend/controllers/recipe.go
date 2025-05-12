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
	db.Where("user_id = ?", userID).Find(&recipes)

	c.JSON(http.StatusOK, gin.H{
		"recipes": recipes,
	})
}

func GetRecipe(c *gin.Context, db *gorm.DB) {
	recipeID := c.Param("id")
	var recipe models.Recipe
	db.First(&recipe, "id = ?", recipeID)

	c.JSON(http.StatusOK, gin.H{
		"recipe": recipe,
	})
}

func AddRecipe(c *gin.Context, db *gorm.DB) {
	userID := uuid.MustParse(c.MustGet("userid").(string))
	newRecipe := &models.Recipe{Name: "New Recipe", UserID: userID}
	db.Create(&newRecipe)
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
	db.Delete(&models.Recipe{}, recipeID)

	c.JSON(http.StatusOK, gin.H{
		"deletedID": recipeID,
	})
}
