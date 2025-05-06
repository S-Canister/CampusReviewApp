package models

import (
	"database/sql"
)

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

// GetAreaByID 通过ID获取区域
func GetAreaByID(db *sql.DB, areaID string) (*Area, error) {
	var area Area
	err := db.QueryRow(`
		SELECT a.id, a.name, 
		       (SELECT COUNT(*) FROM stalls WHERE area_id = a.id) as stall_count,
		       (SELECT COUNT(*) FROM reviews r JOIN stalls s ON r.stall_id = s.id WHERE s.area_id = a.id) as review_count
		FROM areas a
		WHERE a.id = ?
	`, areaID).Scan(&area.ID, &area.Name, &area.StallCount, &area.ReviewCount)
	
	if err != nil {
		return nil, err
	}
	return &area, nil
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
