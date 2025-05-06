package models

// import (
//     "database/sql"
//     "errors"
//     "golang.org/x/crypto/bcrypt"
// )

// // User 定义用户结构体
// type User struct {
//     ID       string `json:"id"`
//     Username string `json:"username"`
//     Password string `json:"-"` // 不在JSON响应中包含密码
// }

// // CreateUser 创建用户
// func CreateUser(db *sql.DB, user User) error {
//     // 检查用户名是否已存在
//     var count int
//     err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", user.Username).Scan(&count)
//     if err != nil {
//         return err
//     }
//     if count > 0 {
//         return errors.New("用户名已存在")
//     }

//     // 加密密码
//     hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
//     if err != nil {
//         return err
//     }

//     // 插入用户记录
//     _, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", 
//                      user.Username, string(hashedPassword))
//     return err
// }

// // Login 用户登录
// func Login(db *sql.DB, username, password string) (*User, error) {
//     var user User
//     var hashedPassword string

//     err := db.QueryRow("SELECT id, username, password FROM users WHERE username = ?", 
//                       username).Scan(&user.ID, &user.Username, &hashedPassword)
//     if err != nil {
//         return nil, err
//     }

//     // 验证密码
//     err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
//     if err != nil {
//         return nil, errors.New("密码不正确")
//     }

//     return &user, nil
// }

// // GetUserByID 通过ID获取用户信息
// func GetUserByID(db *sql.DB, id string) (*User, error) {
//     var user User
//     err := db.QueryRow("SELECT id, username FROM users WHERE id = ?", id).Scan(&user.ID, &user.Username)
//     if err != nil {
//         return nil, err
//     }
//     return &user, nil
// }

// // CountUserReviews 统计用户点评数量
// func CountUserReviews(db *sql.DB, userID string) (int, error) {
//     var count int
//     err := db.QueryRow("SELECT COUNT(*) FROM reviews WHERE user_id = ?", userID).Scan(&count)
//     return count, err
// }

// // CountUserFavorites 统计用户收藏数量
// func CountUserFavorites(db *sql.DB, userID string) (int, error) {
//     var count int
//     err := db.QueryRow("SELECT COUNT(*) FROM favorites WHERE user_id = ?", userID).Scan(&count)
//     return count, err
// }
