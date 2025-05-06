package models

import (
	"database/sql"
)

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

// GetStallByID 通过ID获取档口
func GetStallByID(db *sql.DB, stallID string) (*Stall, error) {
	var stall Stall
	err := db.QueryRow(`
		SELECT s.id, s.area_id, s.name,
		       COALESCE(AVG(r.rating), 0) as avg_rating,
		       COUNT(r.id) as review_count
		FROM stalls s
		LEFT JOIN reviews r ON s.id = r.stall_id
		WHERE s.id = ?
		GROUP BY s.id
	`, stallID).Scan(&stall.ID, &stall.AreaID, &stall.Name, &stall.AvgRating, &stall.ReviewCount)
	
	if err != nil {
		return nil, err
	}
	return &stall, nil
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
