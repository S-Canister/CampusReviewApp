package models

import (
	"database/sql"
	"time"
)

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
