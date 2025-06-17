package controllers

import (
	"net/http"

	"github.com/austinreadhoff/zym/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetHops(c *gin.Context, db *gorm.DB) {
	var hops []models.Hop
	db.Find(&hops)

	c.JSON(http.StatusOK, gin.H{
		"hops": hops,
	})
}
