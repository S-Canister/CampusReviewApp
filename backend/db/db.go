package db

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"os"
	_ "github.com/mattn/go-sqlite3"
)

// InitDB 初始化数据库连接
func InitDB() (*sql.DB, error) {
	// 获取当前工作目录
	dir, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	
	// 设置数据库文件路径
	dbPath := filepath.Join(dir, "campus_review.db")
	fmt.Println("数据库路径:", dbPath)
	
	// 连接数据库
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}
	
	// 测试连接
	err = db.Ping()
	if err != nil {
		return nil, err
	}
	
	return db, nil
}

// CreateAllTables 创建所有表
func CreateAllTables(db *sql.DB) error {
	// 创建用户表
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}
	
	// 创建区域表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS areas (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return err
	}
	
	// 创建档口表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS stalls (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			area_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			location TEXT,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (area_id) REFERENCES areas (id)
		)
	`)
	if err != nil {
		return err
	}
	
	// 创建点评表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS reviews (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			stall_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users (id),
			FOREIGN KEY (stall_id) REFERENCES stalls (id)
		)
	`)
	if err != nil {
		return err
	}
	
	// 创建收藏表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS favorites (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			stall_id INTEGER NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users (id),
			FOREIGN KEY (stall_id) REFERENCES stalls (id),
			UNIQUE (user_id, stall_id)
		)
	`)
	if err != nil {
		return err
	}
	
	// 初始化一些基础数据
	err = initBasicData(db)
	if err != nil {
		return err
	}
	
	return nil
}

// 初始化基础数据
func initBasicData(db *sql.DB) error {
	// 检查区域表是否为空
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM areas").Scan(&count)
	if err != nil {
		return err
	}
	
	// 如果区域表为空，添加一些样例数据
	if count == 0 {
		// 添加区域数据
		areas := []string{
			"海棠餐厅",
			"竹园餐厅",
			"丁香餐厅",
			"新综合楼",
			"老综合楼",
		}
		
		for _, area := range areas {
			_, err := db.Exec("INSERT INTO areas (name) VALUES (?)", area)
			if err != nil {
				return err
			}
		}
		
		// 添加档口数据
		stalls := []struct {
			AreaName string
			StallNames []string
		}{
			{
				AreaName: "海棠餐厅",
				StallNames: []string{"米粉窗口", "川菜窗口", "小炒窗口", "面点窗口", "汤粥窗口"},
			},
			{
				AreaName: "竹园餐厅",
				StallNames: []string{"麻辣香锅", "湘菜窗口", "烧腊窗口", "铁板炒饭", "粤菜窗口"},
			},
			{
				AreaName: "丁香餐厅",
				StallNames: []string{"西北拉面", "东北饺子", "沙茶面", "鸭血粉丝", "烤肉饭"},
			},
			{
				AreaName: "新综合楼",
				StallNames: []string{"水煮系列", "冒菜窗口", "盖浇饭", "卤味窗口", "煲仔饭"},
			},
			{
				AreaName: "老综合楼",
				StallNames: []string{"特色炒饭", "小炒系列", "中西简餐", "清真窗口", "江浙菜系"},
			},
		}
		
		for _, area := range stalls {
			// 获取区域ID
			var areaID int
			err := db.QueryRow("SELECT id FROM areas WHERE name = ?", area.AreaName).Scan(&areaID)
			if err != nil {
				return err
			}
			
			// 添加该区域的档口
			for _, stallName := range area.StallNames {
				_, err := db.Exec("INSERT INTO stalls (area_id, name) VALUES (?, ?)", areaID, stallName)
				if err != nil {
					return err
				}
			}
		}
	}
	
	return nil
}
