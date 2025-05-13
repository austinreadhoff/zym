package controllers

import (
	"net/http"

	"github.com/austinreadhoff/zym/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetStyles(c *gin.Context, db *gorm.DB) {
	var styles []models.Style
	db.Find(&styles)

	c.JSON(http.StatusOK, gin.H{
		"styles": styles,
	})
}
