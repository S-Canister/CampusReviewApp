package models

import (
	"database/sql"
	"errors"
	"time"
)

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

// DeleteFavorite 删除收藏
func DeleteFavorite(db *sql.DB, favoriteID string) error {
	result, err := db.Exec("DELETE FROM favorites WHERE id = ?", favoriteID)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return errors.New("未找到对应收藏记录")
	}
	
	return nil
}

// GetFavoriteByUserAndStall 通过用户ID和档口ID获取收藏
func GetFavoriteByUserAndStall(db *sql.DB, userID, stallID string) (*Favorite, error) {
	var favorite Favorite
	err := db.QueryRow(
		"SELECT id, user_id, stall_id, created_at FROM favorites WHERE user_id = ? AND stall_id = ?",
		userID, stallID,
	).Scan(&favorite.ID, &favorite.UserID, &favorite.StallID, &favorite.CreatedAt)
	
	if err != nil {
		return nil, err
	}
	return &favorite, nil
}
