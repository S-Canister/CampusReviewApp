package db

import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
)

// InitDB 初始化数据库连接
func InitDB() (*sql.DB, error) {
    db, err := sql.Open("sqlite3", "./campus_review.db")
    if err != nil {
        return nil, err
    }
    if err := db.Ping(); err != nil {
        return nil, err
    }
    return db, nil
}

// CreateAllTables 创建所有表
func CreateAllTables(db *sql.DB) error {
    // 创建用户表
    userTableQuery := `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )
    `
    _, err := db.Exec(userTableQuery)
    if err != nil {
        return err
    }

    // 创建区域表
    areaTableQuery := `
    CREATE TABLE IF NOT EXISTS areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )
    `
    _, err = db.Exec(areaTableQuery)
    if err != nil {
        return err
    }

    // 创建档口表
    stallTableQuery := `
    CREATE TABLE IF NOT EXISTS stalls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        area_id INTEGER NOT NULL,
        FOREIGN KEY (area_id) REFERENCES areas(id)
    )
    `
    _, err = db.Exec(stallTableQuery)
    if err != nil {
        return err
    }

    // 创建点评表
    reviewTableQuery := `
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        stall_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (stall_id) REFERENCES stalls(id)
    )
    `
    _, err = db.Exec(reviewTableQuery)
    if err != nil {
        return err
    }

    // 创建收藏表
    favoriteTableQuery := `
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        stall_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (stall_id) REFERENCES stalls(id)
    )
    `
    _, err = db.Exec(favoriteTableQuery)
    return err
}
    