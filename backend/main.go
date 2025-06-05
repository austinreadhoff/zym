package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/austinreadhoff/zym/controllers"
	"github.com/austinreadhoff/zym/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"

	"golang.org/x/crypto/bcrypt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))
var db *gorm.DB

func main() {
	envErr := godotenv.Load("./.env")
	if envErr != nil {
		log.Fatal("Error loading .env file: ", envErr)
	}

	var dbErr error
	db, dbErr = gorm.Open(sqlite.Open("../app.db"), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if dbErr != nil {
		log.Fatal("Failed to connect to database:", dbErr)
	}

	db.AutoMigrate(&models.User{},
		&models.Fermentable{},
		&models.Hop{},
		&models.Style{},
		&models.Recipe{},
		&models.Batch{},
		&models.BatchFermentable{},
		&models.BatchHop{})
	seedUser()
	seedFromStaticDB()

	router := gin.Default()
	config := cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           24 * time.Hour,
	}
	router.Use(cors.New(config))

	router.POST("/api/login", loginHandler)

	protected := router.Group("/api", authMiddleware())

	//Recipe routes
	protected.GET("/recipes", func(c *gin.Context) {
		controllers.GetRecipes(c, db)
	})
	protected.GET("/recipes/:id", func(c *gin.Context) {
		controllers.GetRecipe(c, db)
	})
	protected.POST("/recipes", func(c *gin.Context) {
		controllers.AddRecipe(c, db)
	})
	protected.PUT("/recipes/:id", func(c *gin.Context) {
		controllers.UpdateRecipe(c, db)
	})
	protected.DELETE("/recipes/:id", func(c *gin.Context) {
		controllers.DeleteRecipe(c, db)
	})

	//Batch routes
	protected.POST("/batches", func(c *gin.Context) {
		controllers.AddBatch(c, db)
	})
	protected.PUT("/batches/:id", func(c *gin.Context) {
		controllers.UpdateBatch(c, db)
	})
	protected.DELETE("/batches/:id", func(c *gin.Context) {
		controllers.DeleteBatch(c, db)
	})

	//Misc Routes
	protected.GET("/styles", func(c *gin.Context) {
		controllers.GetStyles(c, db)
	})

	router.Run(":" + os.Getenv("PORT"))
}

func seedUser() {
	var user models.User
	result := db.First(&user, "username = ?", "admin")
	if result.Error != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		db.Create(&models.User{
			Username: "admin",
			Password: string(hashedPassword),
		})
		log.Println("Seeded user: admin / password")
	}
}

func seedFromStaticDB() {
	var staticDB *gorm.DB
	var staticDBErr error
	staticDB, staticDBErr = gorm.Open(sqlite.Open("../static.db"), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if staticDBErr != nil {
		log.Fatal("Failed to connect to database:", staticDBErr)
	}

	var count int64
	db.Model(&models.Style{}).Count(&count)
	if count == 0 {
		var sourceStyles []models.SourceStyle
		staticDB.Find(&sourceStyles)

		var styles []models.Style
		for _, sourceStyle := range sourceStyles {
			style := models.Style{
				Name:  sourceStyle.Name,
				Notes: sourceStyle.Notes,
			}
			styles = append(styles, style)
		}

		db.Create(&styles)
	}
	db.Model(&models.Fermentable{}).Count(&count)
	if count == 0 {
		var sourceFermentables []models.SourceFermentable
		staticDB.Find(&sourceFermentables)

		var fermentables []models.Fermentable
		for _, sourceFermentable := range sourceFermentables {
			fermentable := models.Fermentable{
				Name:  sourceFermentable.Name,
				Yield: sourceFermentable.Yield,
				Color: sourceFermentable.Color,
				Mash:  sourceFermentable.Mash,
				Notes: sourceFermentable.Notes,
			}
			fermentables = append(fermentables, fermentable)
		}

		db.Create(&fermentables)
	}
	db.Model(&models.Hop{}).Count(&count)
	if count == 0 {
		var sourceHops []models.SourceHop
		staticDB.Find(&sourceHops)

		var hops []models.Hop
		for _, sourceHop := range sourceHops {
			hop := models.Hop{
				Name:      sourceHop.Name,
				AlphaAcid: sourceHop.AlphaAcid,
				Notes:     sourceHop.Notes,
			}
			hops = append(hops, hop)
		}

		db.Create(&hops)
	}
}

func loginHandler(c *gin.Context) {
	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.BindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user models.User
	result := db.First(&user, "username = ?", credentials.Username)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userid": user.ID,
		"exp":    jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
	})

	tokenStr, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenStr})
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := c.GetHeader("Authorization")
		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		userid := claims["userid"].(string)
		c.Set("userid", userid)

		c.Next()
	}
}
