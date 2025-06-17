package controllers

import (
	"net/http"

	"github.com/austinreadhoff/zym/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetFermentables(c *gin.Context, db *gorm.DB) {
	var fermentables []models.Fermentable
	db.Find(&fermentables)

	c.JSON(http.StatusOK, gin.H{
		"fermentables": fermentables,
	})
}
