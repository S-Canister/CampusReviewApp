package models

import (
	"database/sql"
	"errors"
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

// CreateUser 创建用户
func CreateUser(db *sql.DB, user User) error {
	// 检查用户名是否已存在
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", user.Username).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("用户名已存在")
	}

	// // 加密密码
	// hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	// if err != nil {
	// 	return err
	// }

	// 插入用户记录
	_, err = db.Exec(
		"INSERT INTO users (username, password) VALUES (?, ?)",
		user.Username, user.Password,
	)
	return err
}

// Login 用户登录
func Login(db *sql.DB, username, password string) (*User, error) {
	var user User
	// var hashedPassword string

	err := db.QueryRow("SELECT id, username, password FROM users WHERE username = ?", username).Scan(
		&user.ID, &user.Username, &user.Password,
	)
	if err != nil {
		return nil, err
	}

	// 验证密码
	// err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	

	// if err != nil {
	// 	return nil, errors.New("密码不正确")
	// }

	if user.Password != password {
		return nil, errors.New("密码不正确")
	}

	return &user, nil
}

// GetAllAreas 获取所有区域
func GetAllAreas(db *sql.DB) ([]Area, error) {
	rows, err := db.Query(`
		SELECT a.id, a.name, 
		       (SELECT COUNT(*) FROM stalls WHERE area_id = a.id) as stall_count,
		       (SELECT COUNT(*) FROM reviews r JOIN stalls s ON r.stall_id = s.id WHERE s.area_id = a.id) as review_count
		FROM areas a
		ORDER BY a.name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var areas []Area
	for rows.Next() {
		var area Area
		if err := rows.Scan(&area.ID, &area.Name, &area.StallCount, &area.ReviewCount); err != nil {
			return nil, err
		}
		areas = append(areas, area)
	}
	return areas, nil
}

// GetStallsByAreaID 获取指定区域的档口
func GetStallsByAreaID(db *sql.DB, areaID string) ([]Stall, error) {
	rows, err := db.Query(`
		SELECT s.id, s.area_id, s.name,
		       COALESCE(AVG(r.rating), 0) as avg_rating,
		       COUNT(r.id) as review_count
		FROM stalls s
		LEFT JOIN reviews r ON s.id = r.stall_id
		WHERE s.area_id = ?
		GROUP BY s.id
		ORDER BY s.name
	`, areaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stalls []Stall
	for rows.Next() {
		var stall Stall
		if err := rows.Scan(&stall.ID, &stall.AreaID, &stall.Name, &stall.AvgRating, &stall.ReviewCount); err != nil {
			return nil, err
		}
		stalls = append(stalls, stall)
	}
	return stalls, nil
}

// GetPopularStalls 获取热门档口
func GetPopularStalls(db *sql.DB, limit int) ([]Stall, error) {
	rows, err := db.Query(`
		SELECT s.id, s.area_id, s.name,
		       COALESCE(AVG(r.rating), 0) as avg_rating,
		       COUNT(r.id) as review_count
		FROM stalls s
		LEFT JOIN reviews r ON s.id = r.stall_id
		GROUP BY s.id
		ORDER BY review_count DESC, avg_rating DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stalls []Stall
	for rows.Next() {
		var stall Stall
		if err := rows.Scan(&stall.ID, &stall.AreaID, &stall.Name, &stall.AvgRating, &stall.ReviewCount); err != nil {
			return nil, err
		}
		stalls = append(stalls, stall)
	}
	return stalls, nil
}

// GetReviewsByStallID 获取指定档口的点评
func GetReviewsByStallID(db *sql.DB, stallID string) ([]Review, error) {
	rows, err := db.Query(`
		SELECT r.id, r.user_id, u.username, r.stall_id, r.content, r.rating, r.created_at
		FROM reviews r
		JOIN users u ON r.user_id = u.id
		WHERE r.stall_id = ?
		ORDER BY r.created_at DESC
	`, stallID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []Review
	for rows.Next() {
		var review Review
		if err := rows.Scan(&review.ID, &review.UserID, &review.Username, &review.StallID, 
		                   &review.Content, &review.Rating, &review.CreatedAt); err != nil {
			return nil, err
		}
		reviews = append(reviews, review)
	}
	return reviews, nil
}

// GetReviewsByUserID 获取指定用户的点评
func GetReviewsByUserID(db *sql.DB, userID string) ([]Review, error) {
	rows, err := db.Query(`
		SELECT r.id, r.user_id, u.username, r.stall_id, r.content, r.rating, r.created_at
		FROM reviews r
		JOIN users u ON r.user_id = u.id
		WHERE r.user_id = ?
		ORDER BY r.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []Review
	for rows.Next() {
		var review Review
		if err := rows.Scan(&review.ID, &review.UserID, &review.Username, &review.StallID, 
		                   &review.Content, &review.Rating, &review.CreatedAt); err != nil {
			return nil, err
		}
		reviews = append(reviews, review)
	}
	return reviews, nil
}

// CreateReview 创建点评
func CreateReview(db *sql.DB, review Review) error {
	_, err := db.Exec(
		"INSERT INTO reviews (user_id, stall_id, content, rating, created_at) VALUES (?, ?, ?, ?, ?)",
		review.UserID, review.StallID, review.Content, review.Rating, time.Now(),
	)
	return err
}

// GetFavoritesByUserID 获取用户收藏
func GetFavoritesByUserID(db *sql.DB, userID string) ([]Favorite, error) {
	rows, err := db.Query(`
		SELECT f.id, f.user_id, f.stall_id, f.created_at,
		       s.id, s.area_id, s.name,
		       COALESCE(AVG(r.rating), 0) as avg_rating,
		       COUNT(r.id) as review_count
		FROM favorites f
		JOIN stalls s ON f.stall_id = s.id
		LEFT JOIN reviews r ON s.id = r.stall_id
		WHERE f.user_id = ?
		GROUP BY f.id
		ORDER BY f.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var favorites []Favorite
	for rows.Next() {
		var favorite Favorite
		favorite.Stall = new(Stall)
		if err := rows.Scan(&favorite.ID, &favorite.UserID, &favorite.StallID, &favorite.CreatedAt,
		                   &favorite.Stall.ID, &favorite.Stall.AreaID, &favorite.Stall.Name,
		                   &favorite.Stall.AvgRating, &favorite.Stall.ReviewCount); err != nil {
			return nil, err
		}
		favorites = append(favorites, favorite)
	}
	return favorites, nil
}

// CreateFavorite 创建收藏
func CreateFavorite(db *sql.DB, favorite Favorite) error {
	// 检查是否已收藏
	var count int
	err := db.QueryRow(
		"SELECT COUNT(*) FROM favorites WHERE user_id = ? AND stall_id = ?",
		favorite.UserID, favorite.StallID,
	).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("您已收藏该档口")
	}

	_, err = db.Exec(
		"INSERT INTO favorites (user_id, stall_id, created_at) VALUES (?, ?, ?)",
		favorite.UserID, favorite.StallID, time.Now(),
	)
	return err
}

// CountUserReviews 统计用户点评数量
func CountUserReviews(db *sql.DB, userID string) (int, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM reviews WHERE user_id = ?", userID).Scan(&count)
	return count, err
}

// CountUserFavorites 统计用户收藏数量
func CountUserFavorites(db *sql.DB, userID string) (int, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM favorites WHERE user_id = ?", userID).Scan(&count)
	return count, err
}

// SearchAreas 搜索区域
func SearchAreas(db *sql.DB, keyword string) ([]Area, error) {
	keyword = "%" + keyword + "%"
	rows, err := db.Query(`
		SELECT a.id, a.name, 
		       (SELECT COUNT(*) FROM stalls WHERE area_id = a.id) as stall_count,
		       (SELECT COUNT(*) FROM reviews r JOIN stalls s ON r.stall_id = s.id WHERE s.area_id = a.id) as review_count
		FROM areas a
		WHERE a.name LIKE ?
		ORDER BY a.name
	`, keyword)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var areas []Area
	for rows.Next() {
		var area Area
		if err := rows.Scan(&area.ID, &area.Name, &area.StallCount, &area.ReviewCount); err != nil {
			return nil, err
		}
		areas = append(areas, area)
	}
	return areas, nil
}

// SearchStalls 搜索档口
func SearchStalls(db *sql.DB, keyword string) ([]Stall, error) {
	keyword = "%" + keyword + "%"
	rows, err := db.Query(`
		SELECT s.id, s.area_id, s.name,
		       COALESCE(AVG(r.rating), 0) as avg_rating,
		       COUNT(r.id) as review_count
		FROM stalls s
		LEFT JOIN reviews r ON s.id = r.stall_id
		WHERE s.name LIKE ?
		GROUP BY s.id
		ORDER BY s.name
	`, keyword)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stalls []Stall
	for rows.Next() {
		var stall Stall
		if err := rows.Scan(&stall.ID, &stall.AreaID, &stall.Name, &stall.AvgRating, &stall.ReviewCount); err != nil {
			return nil, err
		}
		stalls = append(stalls, stall)
	}
	return stalls, nil
}
