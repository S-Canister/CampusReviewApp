# CampusReviewApp - 校园点评应用

校园点评应用是一个专为校园师生设计的美食点评平台，用户可以浏览校园内各个区域的美食档口，查看评分和点评，并分享自己的美食体验。

## 功能特性

- 🔐 用户注册与登录系统
- 🏫 校园区域和美食档口浏览
- ⭐ 评分和点评功能
- ❤️ 收藏喜爱的美食档口
- 🔍 搜索区域和档口
- 📱 移动优先的响应式设计
- 👤 个人中心管理点评和收藏

## 技术栈

### 前端
- HTML5, CSS3, JavaScript
- Bootstrap 5 (UI框架)
- Bootstrap Icons (图标库)

### 后端
- Go语言
- Gin Web框架
- SQLite数据库

## 需求 (Requirements)

### 系统要求
- Go 1.15+
- Node.js 14+ (用于前端开发工具，可选)
- 现代浏览器 (Chrome, Firefox, Safari, Edge等)

### 依赖包
- github.com/gin-gonic/gin
- github.com/mattn/go-sqlite3
- golang.org/x/crypto

## 快速开始 (Quick Start)

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/CampusReviewApp.git
cd CampusReviewApp
```

### 2. 安装依赖

```bash
go mod download
```

### 3. 编译并运行

```bash
go run backend/main.go
```

应用将在 http://localhost:8080 启动

### 4. 初始账户

第一次使用时，您可以注册自己的账号，或使用以下测试账号：
- 用户名: 123
- 密码: 123

## 项目结构

```
CampusReviewApp/
├── backend/
│   ├── db/          # 数据库初始化和操作
│   ├── models/      # 数据模型和业务逻辑
│   └── main.go      # 主程序入口
├── frontend/
│   ├── css/         # 样式文件
│   ├── js/          # JavaScript脚本
│   ├── templates/   # HTML模板
│   └── index.html   # 主页面
└── README.md        # 项目说明文档
```

## 使用说明

1. 首次访问时，需要先注册账号或使用测试账号登录
2. 登录后可浏览校园各区域和美食档口
3. 点击区域或档口进入详情页面
4. 在详情页面可以查看其他用户的点评
5. 可以对档口进行评分和点评
6. 在个人中心可以查看自己的点评和收藏

## 开发指南

### 前端开发

前端采用了模块化的结构，主要文件包括：
- `index.html`: 主页面结构
- `css/`: 样式文件，按功能拆分成多个CSS文件
- `js/`: JavaScript脚本，按功能拆分成多个JS文件
- `templates/`: 页面模板，包含各个功能页面的HTML结构

### 后端开发

后端采用MVC架构：
- `main.go`: 路由配置和服务启动
- `db/`: 数据库连接和表结构创建
- `models/`: 数据模型和业务逻辑

## 许可

MIT License