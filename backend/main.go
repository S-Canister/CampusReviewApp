package main

import (
	"fmt"
	"net/http"
	// "database/sql"
	"github.com/gin-gonic/gin"
	"github.com/S-Canister/CampusReviewApp/backend/models"
	"github.com/S-Canister/CampusReviewApp/backend/db"
	_ "github.com/mattn/go-sqlite3" // 添加 SQLite3 驱动
	// "path/filepath"
)

func main() {
	r := gin.Default()

	// 创建表格
	dbConn, err := db.InitDB()
	if err != nil {
		fmt.Println("Failed to connect to database:", err)
		return
	}
	if err := db.CreateAllTables(dbConn); err != nil {
		fmt.Println("Failed to create tables:", err)
		return
	}
	defer dbConn.Close()

	r.Static("/", "./frontend") // 设置静态文件目录

	r.POST("/register", func(c *gin.Context) {
		var newUser models.User
		if err := c.BindJSON(&newUser); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		err := models.CreateUser(dbConn, newUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
	}) 

	r.POST("/login", func(c *gin.Context) {
		var loginData struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.BindJSON(&loginData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		user, err := models.Login(dbConn, loginData.Username, loginData.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
			return
		}
		c.JSON(http.StatusOK, user)
	})

	// Start the server on port 8080
	if err := r.Run(":8080"); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}