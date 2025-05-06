// 全局变量
let currentUser = null;
let currentAreaId = null;
let currentStallId = null;
let currentRating = 0;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面
    showPage('login-page');
    
    // 初始化底部导航事件
    initNavEvents();
    
    // 初始化返回按钮事件
    initBackButtons();
    
    // 初始化评分系统
    initRatingSystem();
});

// 显示指定页面
function showPage(pageId) {
    const pages = document.querySelectorAll('div[id$="-page"]');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
    
    // 只在登录后显示顶部和底部导航
    const isLoggedIn = currentUser !== null;
    document.getElementById('top-nav').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('bottom-nav').style.display = isLoggedIn ? 'flex' : 'none';
    
    // 更新底部导航的激活状态
    if (isLoggedIn) {
        updateActiveNavItem(pageId);
    }
}

// 更新底部导航的激活状态
function updateActiveNavItem(pageId) {
    const navItems = document.querySelectorAll('#bottom-nav .nav-link');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    if (pageId === 'home-page') {
        document.getElementById('nav-home').classList.add('active');
    } else if (pageId === 'my-reviews-page') {
        document.getElementById('nav-my-reviews').classList.add('active');
    } else if (pageId === 'my-favorites-page') {
        document.getElementById('nav-favorites').classList.add('active');
    } else if (pageId === 'profile-page') {
        document.getElementById('nav-profile').classList.add('active');
    }
}

// 初始化底部导航事件
function initNavEvents() {
    document.getElementById('nav-home').addEventListener('click', () => {
        showPage('home-page');
    });
    
    document.getElementById('nav-my-reviews').addEventListener('click', () => {
        showPage('my-reviews-page');
        getMyReviews();
    });
    
    document.getElementById('nav-favorites').addEventListener('click', () => {
        showPage('my-favorites-page');
        getMyFavorites();
    });
    
    document.getElementById('nav-profile').addEventListener('click', () => {
        showPage('profile-page');
        updateProfileInfo();
    });
}

// 初始化返回按钮事件
function initBackButtons() {
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 根据当前页面决定返回哪个页面
            const currentPage = document.querySelector('div[id$="-page"][style="display: block"]');
            if (currentPage.id === 'area-detail-page') {
                showPage('home-page');
            } else if (currentPage.id === 'stall-detail-page') {
                showPage('area-detail-page');
            } else if (currentPage.id === 'review-page') {
                if (currentStallId) {
                    showPage('stall-detail-page');
                } else {
                    showPage('area-detail-page');
                }
            } else if (currentPage.id === 'search-results-page') {
                showPage('home-page');
            }
        });
    });
}

// 初始化评分系统
function initRatingSystem() {
    const ratingStars = document.querySelectorAll('.rating-star');
    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            currentRating = rating;
            
            // 更新星星显示
            ratingStars.forEach(s => {
                if (parseInt(s.getAttribute('data-rating')) <= rating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                    s.classList.add('active');
                } else {
                    s.classList.remove('bi-star-fill');
                    s.classList.remove('active');
                    s.classList.add('bi-star');
                }
            });
            
            // 更新评分文本
            document.getElementById('selected-rating').textContent = rating;
        });
    });
}

// 显示加载中动画
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

// 隐藏加载中动画
function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// 显示通知提示
function showToast(title, message) {
    const toastEl = document.getElementById('toast-notification');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-message').textContent = message;
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// 登录逻辑
document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showToast('登录失败', '用户名和密码不能为空');
        return;
    }
    
    showLoading();
    try {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data;
            showPage('home-page');
            getAreas();
            getPopularStalls();
            updateUserAvatar();
        } else {
            showToast('登录失败', data.error || '用户名或密码错误');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showToast('登录失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
});

// 注册逻辑
document.getElementById('register-button').addEventListener('click', () => {
    showPage('register-page');
});

document.getElementById('back-to-login-button').addEventListener('click', () => {
    showPage('login-page');
});

document.getElementById('submit-register-button').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!username || !password) {
        showToast('注册失败', '用户名和密码不能为空');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('注册失败', '两次输入的密码不一致');
        return;
    }
    
    showLoading();
    try {
        const response = await fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showToast('注册成功', '请使用新账号登录');
            showPage('login-page');
        } else {
            showToast('注册失败', data.error || '注册失败，请稍后重试');
        }
    } catch (error) {
        console.error('注册失败:', error);
        showToast('注册失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
});

// 获取所有区域
async function getAreas() {
    showLoading();
    try {
        const response = await fetch('http://localhost:8080/areas');
        const areas = await response.json();
        const areaList = document.getElementById('area-list');
        areaList.innerHTML = '';
        
        areas.forEach(area => {
            const card = createAreaCard(area);
            areaList.appendChild(card);
        });
    } catch (error) {
        console.error('获取区域失败:', error);
        showToast('获取区域失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 创建区域卡片
function createAreaCard(area) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${area.name}</h5>
            <div class="card-meta">
                <span><i class="bi bi-shop"></i> ${area.stall_count || 0}个档口</span>
                <span><i class="bi bi-chat-text"></i> ${area.review_count || 0}条点评</span>
            </div>
        </div>
    `;
    div.addEventListener('click', () => {
        currentAreaId = area.id;
        document.getElementById('area-detail-name').textContent = area.name;
        showPage('area-detail-page');
        getStallsByAreaId(area.id);
    });
    return div;
}

// 获取热门档口
async function getPopularStalls() {
    showLoading();
    try {
        const response = await fetch('http://localhost:8080/stalls/popular');
        const stalls = await response.json();
        const stallList = document.getElementById('popular-stalls');
        stallList.innerHTML = '';
        
        stalls.forEach(stall => {
            const card = createStallCard(stall);
            stallList.appendChild(card);
        });
    } catch (error) {
        console.error('获取热门档口失败:', error);
        showToast('获取热门档口失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 根据区域 ID 获取档口
async function getStallsByAreaId(areaId) {
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/stalls?area_id=${areaId}`);
        const stalls = await response.json();
        const stallList = document.getElementById('stall-list');
        stallList.innerHTML = '';
        
        stalls.forEach(stall => {
            const card = createStallCard(stall);
            stallList.appendChild(card);
        });
    } catch (error) {
        console.error('获取档口失败:', error);
        showToast('获取档口失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 创建档口卡片
function createStallCard(stall) {
    const div = document.createElement('div');
    div.className = 'card';
    
    // 计算星星HTML
    const rating = stall.avg_rating || 0;
    const starsHTML = getStarsHTML(rating);
    
    div.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${stall.name}</h5>
            <div class="card-rating">
                ${starsHTML}
                <span>${rating.toFixed(1)}</span>
            </div>
            <div class="card-meta">
                <span><i class="bi bi-chat-text"></i> ${stall.review_count || 0}条点评</span>
            </div>
        </div>
    `;
    div.addEventListener('click', () => {
        currentStallId = stall.id;
        document.getElementById('stall-detail-name').textContent = stall.name;
        showPage('stall-detail-page');
        getReviewsByStallId(stall.id);
        updateStallRating(stall);
    });
    return div;
}

// 获取星星HTML
function getStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += '<i class="bi bi-star-fill"></i>';
        } else if (i - 0.5 <= rating) {
            starsHTML += '<i class="bi bi-star-half"></i>';
        } else {
            starsHTML += '<i class="bi bi-star"></i>';
        }
    }
    return starsHTML;
}

// 更新档口评分显示
function updateStallRating(stall) {
    const avgRating = stall.avg_rating || 0;
    const reviewCount = stall.review_count || 0;
    
    document.getElementById('stall-avg-rating').textContent = avgRating.toFixed(1);
    document.getElementById('stall-review-count').textContent = `${reviewCount}条点评`;
    
    const starsContainer = document.querySelector('.rating-summary .stars');
    starsContainer.innerHTML = getStarsHTML(avgRating);
}

// 根据档口 ID 获取点评
async function getReviewsByStallId(stallId) {
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/reviews?stall_id=${stallId}`);
        const reviews = await response.json();
        const reviewList = document.getElementById('review-list');
        reviewList.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewItem = createReviewItem(review);
            reviewList.appendChild(reviewItem);
        });
    } catch (error) {
        console.error('获取点评失败:', error);
        showToast('获取点评失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 创建点评项
function createReviewItem(review) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    // 获取用户名的首字母作为头像
    const userInitial = review.username ? review.username.charAt(0).toUpperCase() : '匿';
    
    // 格式化日期
    const date = new Date(review.created_at);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    // 计算星星HTML
    const starsHTML = getStarsHTML(review.rating || 0);
    
    div.innerHTML = `
        <div class="review-header">
            <div class="user-avatar">${userInitial}</div>
            <div class="review-user">${review.username || '匿名用户'}</div>
            <div class="review-date">${formattedDate}</div>
        </div>
        <div class="review-rating">${starsHTML}</div>
        <div class="review-content">${review.content}</div>
    `;
    return div;
}

// 提交点评
document.getElementById('stall-review-button').addEventListener('click', () => {
    document.getElementById('review-target-name').textContent = document.getElementById('stall-detail-name').textContent;
    showPage('review-page');
    
    // 重置评分
    resetRating();
});

document.getElementById('submit-review-button').addEventListener('click', async () => {
    const content = document.getElementById('review-content').value;
    const rating = currentRating;
    
    if (!content) {
        showToast('提交失败', '请填写点评内容');
        return;
    }
    
    if (rating === 0) {
        showToast('提交失败', '请选择评分');
        return;
    }
    
    showLoading();
    try {
        const response = await fetch('http://localhost:8080/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                stall_id: currentStallId,
                content: content,
                rating: rating
            })
        });
        
        if (response.ok) {
            showToast('提交成功', '您的点评已提交');
            document.getElementById('review-content').value = '';
            showPage('stall-detail-page');
            getReviewsByStallId(currentStallId);
        } else {
            const data = await response.json();
            showToast('提交失败', data.error || '点评提交失败');
        }
    } catch (error) {
        console.error('点评提交失败:', error);
        showToast('提交失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
});

// 重置评分
function resetRating() {
    currentRating = 0;
    document.getElementById('selected-rating').textContent = '0';
    const ratingStars = document.querySelectorAll('.rating-star');
    ratingStars.forEach(star => {
        star.classList.remove('bi-star-fill');
        star.classList.remove('active');
        star.classList.add('bi-star');
    });
}

// 收藏档口
document.getElementById('favorite-button').addEventListener('click', async () => {
    if (!currentUser || !currentStallId) {
        showToast('收藏失败', '请先登录');
        return;
    }
    
    showLoading();
    try {
        const response = await fetch('http://localhost:8080/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                stall_id: currentStallId
            })
        });
        
        if (response.ok) {
            showToast('收藏成功', '已将该档口添加到收藏');
        } else {
            const data = await response.json();
            showToast('收藏失败', data.error || '收藏失败');
        }
    } catch (error) {
        console.error('收藏失败:', error);
        showToast('收藏失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
});

// 获取我的点评
async function getMyReviews() {
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/reviews?user_id=${currentUser.id}`);
        const reviews = await response.json();
        const reviewList = document.getElementById('my-review-list');
        reviewList.innerHTML = '';
        
        reviews.forEach(review => {
            const reviewItem = createReviewItem(review);
            reviewList.appendChild(reviewItem);
        });
        
        if (reviews.length === 0) {
            reviewList.innerHTML = '<p class="text-center my-5">您还没有发表过点评</p>';
        }
    } catch (error) {
        console.error('获取我的点评失败:', error);
        showToast('获取失败', '获取点评数据失败');
    } finally {
        hideLoading();
    }
}

// 获取我的收藏
async function getMyFavorites() {
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/favorites?user_id=${currentUser.id}`);
        const favorites = await response.json();
        const favoritesList = document.getElementById('my-favorite-list');
        favoritesList.innerHTML = '';
        
        favorites.forEach(favorite => {
            const card = createStallCard(favorite.stall);
            favoritesList.appendChild(card);
        });
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="text-center my-5">您还没有收藏任何档口</p>';
        }
    } catch (error) {
        console.error('获取我的收藏失败:', error);
        showToast('获取失败', '获取收藏数据失败');
    } finally {
        hideLoading();
    }
}

// 更新个人资料页面
function updateProfileInfo() {
    if (!currentUser) return;
    
    // 设置用户名
    document.getElementById('profile-username').textContent = currentUser.username;
    
    // 设置头像
    const initial = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profile-avatar').textContent = initial;
    
    // 设置数据统计（可能需要额外API请求）
    fetchUserStats();
}

// 获取用户统计数据
async function fetchUserStats() {
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/users/${currentUser.id}/stats`);
        const stats = await response.json();
        
        document.getElementById('review-count').textContent = stats.review_count || 0;
        document.getElementById('favorite-count').textContent = stats.favorite_count || 0;
    } catch (error) {
        console.error('获取用户统计失败:', error);
    } finally {
        hideLoading();
    }
}

// 更新用户头像
function updateUserAvatar() {
    if (!currentUser) return;
    
    const initial = currentUser.username.charAt(0).toUpperCase();
    const avatarElements = document.querySelectorAll('.user-avatar');
    avatarElements.forEach(el => {
        el.textContent = initial;
    });
}

// 退出登录
document.getElementById('logout-button').addEventListener('click', () => {
    currentUser = null;
    currentAreaId = null;
    currentStallId = null;
    showPage('login-page');
    showToast('退出成功', '您已成功退出登录');
});

// 搜索功能
document.getElementById('search-button').addEventListener('click', () => {
    const keyword = document.getElementById('search-input').value;
    if (!keyword.trim()) {
        showToast('搜索失败', '请输入搜索关键词');
        return;
    }
    
    performSearch(keyword);
});

// 执行搜索
async function performSearch(keyword) {
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/search?keyword=${encodeURIComponent(keyword)}`);
        const results = await response.json();
        
        document.getElementById('search-query').textContent = `搜索: ${keyword}`;
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';
        
        if (results.areas && results.areas.length > 0) {
            const areaTitle = document.createElement('h3');
            areaTitle.textContent = '区域';
            searchResults.appendChild(areaTitle);
            
            results.areas.forEach(area => {
                const card = createAreaCard(area);
                searchResults.appendChild(card);
            });
        }
        
        if (results.stalls && results.stalls.length > 0) {
            const stallTitle = document.createElement('h3');
            stallTitle.className = 'mt-4';
            stallTitle.textContent = '档口';
            searchResults.appendChild(stallTitle);
            
            results.stalls.forEach(stall => {
                const card = createStallCard(stall);
                searchResults.appendChild(card);
            });
        }
        
        if ((!results.areas || results.areas.length === 0) && 
            (!results.stalls || results.stalls.length === 0)) {
            searchResults.innerHTML = '<p class="text-center my-5">没有找到相关结果</p>';
        }
        
        showPage('search-results-page');
    } catch (error) {
        console.error('搜索失败:', error);
        showToast('搜索失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 监听搜索框的回车键
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const keyword = document.getElementById('search-input').value;
        if (keyword.trim()) {
            performSearch(keyword);
        }
    }
});