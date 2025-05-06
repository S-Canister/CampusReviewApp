package models

import (
	// "database/sql"
	// "errors"
	"time"
	// "fmt"
	_ "golang.org/x/crypto/bcrypt"
)

// User 用户模型
type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// Area 区域模型
type Area struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	StallCount int    `json:"stall_count,omitempty"`
	ReviewCount int   `json:"review_count,omitempty"`
}

// Stall 档口模型
type Stall struct {
	ID         string  `json:"id"`
	AreaID     string  `json:"area_id"`
	Name       string  `json:"name"`
	AvgRating  float64 `json:"avg_rating,omitempty"`
	ReviewCount int     `json:"review_count,omitempty"`
}

// Review 点评模型
type Review struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Username  string    `json:"username,omitempty"`
	StallID   string    `json:"stall_id"`
	Content   string    `json:"content"`
	Rating    int       `json:"rating"`
	CreatedAt time.Time `json:"created_at"`
}

// Favorite 收藏模型
type Favorite struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	StallID   string    `json:"stall_id"`
	Stall     *Stall    `json:"stall,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
