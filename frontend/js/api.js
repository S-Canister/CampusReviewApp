// API基础URL
const API_BASE_URL = 'http://localhost:8080';

// 用户登录
async function apiLogin(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    
    return await response.json();
}

// 用户注册
async function apiRegister(username, password) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    
    return await response.json();
}

// 获取所有区域
async function apiGetAreas() {
    const response = await fetch(`${API_BASE_URL}/areas`);
    
    if (!response.ok) {
        throw new Error(`获取区域失败: ${response.status}`);
    }
    
    return await response.json();
}

// 获取单个区域信息
async function apiGetAreaById(areaId) {
    const response = await fetch(`${API_BASE_URL}/areas/${areaId}`);
    
    if (!response.ok) {
        throw new Error(`获取区域信息失败: ${response.status}`);
    }
    
    return await response.json();
}

// 获取热门档口
async function apiGetPopularStalls(limit = 10) {
    const response = await fetch(`${API_BASE_URL}/stalls/popular?limit=${limit}`);
    
    if (!response.ok) {
        throw new Error(`获取热门档口失败: ${response.status}`);
    }
    
    return await response.json();
}

// 获取区域下的档口
async function apiGetStallsByAreaId(areaId) {
    const response = await fetch(`${API_BASE_URL}/stalls?area_id=${areaId}`);
    
    if (!response.ok) {
        throw new Error(`获取区域档口失败: ${response.status}`);
    }
    
    return await response.json();
}

// 获取单个档口信息
async function apiGetStallById(stallId) {
    const response = await fetch(`${API_BASE_URL}/stalls/${stallId}`);
    
    if (!response.ok) {
        throw new Error(`获取档口信息失败: ${response.status}`);
    }
    
    return await response.json();
}

// 获取档口点评
async function apiGetReviewsByStallId(stallId) {
    const response = await fetch(`${API_BASE_URL}/reviews?stall_id=${stallId}`);
    
    if (!response.ok) {
        throw new Error(`获取档口点评失败: ${response.status}`);
    }
    
    return await response.json();
}

// 获取用户点评
async function apiGetReviewsByUserId(userId) {
    const response = await fetch(`${API_BASE_URL}/reviews?user_id=${userId}`);
    
    if (!response.ok) {
        throw new Error(`获取用户点评失败: ${response.status}`);
    }
    
    return await response.json();
}

// 创建点评
async function apiCreateReview(reviewData) {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
        throw new Error(`创建点评失败: ${response.status}`);
    }
    
    return await response.json();
}

// 获取用户收藏
async function apiGetFavoritesByUserId(userId) {
    const response = await fetch(`${API_BASE_URL}/favorites?user_id=${userId}`);
    
    if (!response.ok) {
        throw new Error(`获取用户收藏失败: ${response.status}`);
    }
    
    return await response.json();
}

// 检查档口收藏状态
async function apiCheckFavoriteStatus(userId, stallId) {
    const response = await fetch(`${API_BASE_URL}/favorites?user_id=${userId}&stall_id=${stallId}`);
    
    if (!response.ok) {
        throw new Error(`检查收藏状态失败: ${response.status}`);
    }
    
    const favorites = await response.json();
    return favorites && favorites.length > 0;
}

// 添加收藏
async function apiAddFavorite(userId, stallId) {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, stall_id: stallId })
    });
    
    if (!response.ok) {
        throw new Error(`添加收藏失败: ${response.status}`);
    }
    
    return await response.json();
}

// 删除收藏
async function apiRemoveFavorite(favoriteId) {
    const response = await fetch(`${API_BASE_URL}/favorites/${favoriteId}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error(`删除收藏失败: ${response.status}`);
    }
    
    return true;
}

// 获取用户统计数据
async function apiGetUserStats(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`);
    
    if (!response.ok) {
        throw new Error(`获取用户统计失败: ${response.status}`);
    }
    
    return await response.json();
}

// 搜索
async function apiSearch(keyword) {
    const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`);
    
    if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`);
    }
    
    return await response.json();
}
