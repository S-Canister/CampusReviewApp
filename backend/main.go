package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/S-Canister/CampusReviewApp/backend/models"
	"github.com/S-Canister/CampusReviewApp/backend/db"
	_ "github.com/mattn/go-sqlite3"
	"strconv"
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

	// 配置CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 用户相关API
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

	// 用户统计信息
	r.GET("/users/:id/stats", func(c *gin.Context) {
		userID := c.Param("id")
		reviewCount, err := models.CountUserReviews(dbConn, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get review count"})
			return
		}
		
		favoriteCount, err := models.CountUserFavorites(dbConn, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorite count"})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"review_count": reviewCount,
			"favorite_count": favoriteCount,
		})
	})

	// 区域相关API
	r.GET("/areas", func(c *gin.Context) {
		areas, err := models.GetAllAreas(dbConn)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get areas"})
			return
		}
		c.JSON(http.StatusOK, areas)
	})

	// 获取单个区域信息
	r.GET("/areas/:id", func(c *gin.Context) {
		areaID := c.Param("id")
		area, err := models.GetAreaByID(dbConn, areaID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get area"})
			return
		}
		c.JSON(http.StatusOK, area)
	})

	// 档口相关API
	r.GET("/stalls", func(c *gin.Context) {
		areaID := c.Query("area_id")
		if areaID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing area_id parameter"})
			return
		}
		
		stalls, err := models.GetStallsByAreaID(dbConn, areaID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stalls"})
			return
		}
		c.JSON(http.StatusOK, stalls)
	})

	// 获取热门档口 - 注意：必须放在"/stalls/:id"前面
	r.GET("/stalls/popular", func(c *gin.Context) {
		limit := 10
		limitStr := c.Query("limit")
		if limitStr != "" {
			var err error
			limit, err = strconv.Atoi(limitStr)
			if err != nil {
				limit = 10
			}
		}
		
		stalls, err := models.GetPopularStalls(dbConn, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get popular stalls"})
			return
		}
		c.JSON(http.StatusOK, stalls)
	})

	// 获取单个档口信息 - 注意：必须放在"/stalls/popular"后面
	r.GET("/stalls/:id", func(c *gin.Context) {
		stallID := c.Param("id")
		stall, err := models.GetStallByID(dbConn, stallID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stall"})
			return
		}
		c.JSON(http.StatusOK, stall)
	})

	// 点评相关API
	r.GET("/reviews", func(c *gin.Context) {
		stallID := c.Query("stall_id")
		userID := c.Query("user_id")
		
		var reviews []models.Review
		var err error
		
		if stallID != "" {
			reviews, err = models.GetReviewsByStallID(dbConn, stallID)
		} else if userID != "" {
			reviews, err = models.GetReviewsByUserID(dbConn, userID)
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing stall_id or user_id parameter"})
			return
		}
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get reviews"})
			return
		}
		c.JSON(http.StatusOK, reviews)
	})

	r.POST("/reviews", func(c *gin.Context) {
		var newReview models.Review
		if err := c.BindJSON(&newReview); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		
		err := models.CreateReview(dbConn, newReview)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Review created successfully"})
	})

	// 收藏相关API
	r.GET("/favorites", func(c *gin.Context) {
		userID := c.Query("user_id")
		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing user_id parameter"})
			return
		}
		
		favorites, err := models.GetFavoritesByUserID(dbConn, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
			return
		}
		c.JSON(http.StatusOK, favorites)
	})

	r.POST("/favorites", func(c *gin.Context) {
		var newFavorite models.Favorite
		if err := c.BindJSON(&newFavorite); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		
		err := models.CreateFavorite(dbConn, newFavorite)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create favorite"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Favorite created successfully"})
	})

	// 删除收藏
	r.DELETE("/favorites/:id", func(c *gin.Context) {
		favoriteID := c.Param("id")
		err := models.DeleteFavorite(dbConn, favoriteID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete favorite"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Favorite deleted successfully"})
	})

	// 搜索功能
	r.GET("/search", func(c *gin.Context) {
		keyword := c.Query("keyword")
		if keyword == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing keyword parameter"})
			return
		}
		
		areas, err := models.SearchAreas(dbConn, keyword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search areas"})
			return
		}
		
		stalls, err := models.SearchStalls(dbConn, keyword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search stalls"})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"areas": areas,
			"stalls": stalls,
		})
	})

	// 静态文件服务 - 修改后的配置
	// 首页
	r.StaticFile("/", "./frontend/index.html")
	
	// CSS文件 - 包括直接使用style.css的情况
	r.Static("/css", "./frontend/css")
	
	// JavaScript文件
	r.Static("/js", "./frontend/js")
	
	// 模板文件
	r.Static("/templates", "./frontend/templates")
	
	// 图片等其他静态资源
	r.Static("/assets", "./frontend/assets")

	// 支持单页应用的路由，任何未匹配到的路由返回index.html
	r.NoRoute(func(c *gin.Context) {
		// 检查是否直接访问了静态资源
		if strings.HasSuffix(c.Request.URL.Path, ".js") || 
		   strings.HasSuffix(c.Request.URL.Path, ".css") || 
		   strings.HasSuffix(c.Request.URL.Path, ".html") || 
		   strings.HasSuffix(c.Request.URL.Path, ".png") || 
		   strings.HasSuffix(c.Request.URL.Path, ".jpg") {
			// 尝试从静态文件夹提供
			localPath := "./frontend" + c.Request.URL.Path
			if _, err := os.Stat(localPath); err == nil {
				c.File(localPath)
				return
			}
		}
		
		// 默认返回index.html
		c.File("./frontend/index.html")
	})

	// Start the server on port 8080
	if err := r.Run(":8080"); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}