package models

import (
    "database/sql"
)

// User 定义用户结构体
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Password string `json:"password"`
}

// CreateUser 创建用户
func CreateUser(db *sql.DB, user User) error {
    _, err := db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", user.Username, user.Password)
    return err
}

// Login 用户登录
func Login(db *sql.DB, username, password string) (User, error) {
    var user User
    err := db.QueryRow("SELECT id, username, password FROM users WHERE username = ? AND password = ?", username, password).Scan(&user.ID, &user.Username, &user.Password)
    return user, err
}
    