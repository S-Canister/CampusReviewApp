// 全局变量
let currentUser = null;
let currentAreaId = null;
let currentStallId = null;
let currentRating = 0;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化路由系统
    initRouteSystem();
    
    // 初始化评分系统
    initRatingSystem();
    
    // 显示加载中动画
    showLoading();
    
    // 检查登录状态
    checkLoginStatus();
    
    // 隐藏加载中动画
    hideLoading();
});

// 初始化路由系统
function initRouteSystem() {
    // 监听URL变化
    window.addEventListener('hashchange', handleRouteChange);
    
    // 绑定导航链接事件
    bindNavigationEvents();
    
    // 初始路由处理
    handleRouteChange();
}

// 绑定导航事件
function bindNavigationEvents() {
    // 底部导航栏绑定
    document.getElementById('nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/');
    });
    
    document.getElementById('nav-my-reviews').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/reviews');
    });
    
    document.getElementById('nav-favorites').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/favorites');
    });
    
    document.getElementById('nav-profile').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/profile');
    });
    
    // 顶部导航栏品牌点击
    document.querySelector('.navbar-brand').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/');
    });
    
    // 搜索按钮
    document.getElementById('search-button').addEventListener('click', (e) => {
        e.preventDefault();
        const keyword = document.getElementById('search-input').value;
        if (keyword.trim()) {
            navigateTo(`/search?q=${encodeURIComponent(keyword)}`);
        } else {
            showToast('搜索', '请输入搜索关键词');
        }
    });
    
    // 搜索框回车键
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const keyword = document.getElementById('search-input').value;
            if (keyword.trim()) {
                navigateTo(`/search?q=${encodeURIComponent(keyword)}`);
            }
        }
    });
    
    // 登录按钮
    document.getElementById('login-button').addEventListener('click', handleLogin);
    
    // 注册按钮
    document.getElementById('register-button').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/register');
    });
    
    // 返回登录按钮
    document.getElementById('back-to-login-button').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/login');
    });
    
    // 提交注册按钮
    document.getElementById('submit-register-button').addEventListener('click', handleRegister);
    
    // 退出登录按钮
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    
    // 提交点评按钮
    document.getElementById('submit-review-button').addEventListener('click', submitReview);
    
    // 返回按钮
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back();
        });
    });
    
    // 档口点评按钮
    document.getElementById('stall-review-button').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStallId) {
            const stallName = document.getElementById('stall-detail-name').textContent;
            navigateTo(`/stalls/${currentStallId}/review?name=${encodeURIComponent(stallName)}`);
        }
    });
    
    // 区域点评按钮
    document.getElementById('area-review-button').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentAreaId) {
            const areaName = document.getElementById('area-detail-name').textContent;
            navigateTo(`/areas/${currentAreaId}/review?name=${encodeURIComponent(areaName)}`);
        }
    });
    
    // 收藏按钮
    document.getElementById('favorite-button').addEventListener('click', toggleFavorite);
}

// 处理路由变化
function handleRouteChange() {
    // 获取当前路由路径
    const hash = window.location.hash.substring(1) || '/';
    const [path, queryString] = hash.split('?');
    
    // 解析查询参数
    const params = {};
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value || '');
        });
    }
    
    // 先检查用户登录状态
    if (!currentUser && path !== '/login' && path !== '/register') {
        navigateTo('/login');
        return;
    }
    
    // 路由映射
    routeToPage(path, params);
    
    // 更新激活的导航项
    updateActiveNavItem(path);
}

// 路由到对应页面
function routeToPage(path, params) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.content-page, .auth-page');
    pages.forEach(page => page.style.display = 'none');
    
    // 路由分发
    if (path === '/' || path === '') {
        if (!currentUser) {
            showPage('login-page');
        } else {
            showPage('home-page');
            loadHomePage();
        }
    } 
    else if (path === '/login') {
        showPage('login-page');
    }
    else if (path === '/register') {
        showPage('register-page');
    }
    else if (path === '/profile') {
        showPage('profile-page');
        loadProfilePage();
    }
    else if (path === '/reviews') {
        showPage('my-reviews-page');
        loadMyReviews();
    }
    else if (path === '/favorites') {
        showPage('my-favorites-page');
        loadMyFavorites();
    }
    else if (path === '/search') {
        showPage('search-results-page');
        if (params.q) {
            document.getElementById('search-query').textContent = `搜索: ${params.q}`;
            performSearch(params.q);
        }
    }
    // 区域详情
    else if (path.match(/^\/areas\/\d+$/)) {
        const areaId = path.split('/')[2];
        currentAreaId = areaId;
        showPage('area-detail-page');
        loadAreaDetails(areaId);
    }
    // 档口详情
    else if (path.match(/^\/stalls\/\d+$/)) {
        const stallId = path.split('/')[2];
        currentStallId = stallId;
        showPage('stall-detail-page');
        loadStallDetails(stallId);
    }
    // 区域点评
    else if (path.match(/^\/areas\/\d+\/review$/)) {
        const areaId = path.split('/')[2];
        currentAreaId = areaId;
        currentStallId = null;
        showPage('review-page');
        document.getElementById('review-target-name').textContent = params.name || `区域 ${areaId} 点评`;
        resetRating();
    }
    // 档口点评
    else if (path.match(/^\/stalls\/\d+\/review$/)) {
        const stallId = path.split('/')[2];
        currentStallId = stallId;
        showPage('review-page');
        document.getElementById('review-target-name').textContent = params.name || `档口 ${stallId} 点评`;
        resetRating();
    }
    else {
        // 未知路由，返回首页
        navigateTo('/');
    }
}

// 显示页面
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.content-page, .auth-page').forEach(page => {
        page.style.display = 'none';
    });
    
    // 显示指定页面
    document.getElementById(pageId).style.display = 'block';
    
    // 显示/隐藏导航栏
    const isAuthenticated = currentUser !== null;
    document.getElementById('top-nav').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('bottom-nav').style.display = isAuthenticated ? 'flex' : 'none';
    
    // 如果已登录，更新用户头像
    if (isAuthenticated) {
        updateUserAvatar();
    }
}

// 导航到指定路由
function navigateTo(path) {
    window.location.hash = path;
}

// 更新激活的导航项
function updateActiveNavItem(path) {
    const navItems = document.querySelectorAll('#bottom-nav .nav-link');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    if (path === '/' || path === '') {
        document.getElementById('nav-home').classList.add('active');
    } else if (path === '/reviews') {
        document.getElementById('nav-my-reviews').classList.add('active');
    } else if (path === '/favorites') {
        document.getElementById('nav-favorites').classList.add('active');
    } else if (path === '/profile') {
        document.getElementById('nav-profile').classList.add('active');
    }
}

// 检查登录状态
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUserAvatar();
            
            // 如果当前是登录或注册页面，跳转到首页
            if (window.location.hash === '#/login' || window.location.hash === '#/register' || !window.location.hash) {
                navigateTo('/');
            }
        } catch (e) {
            console.error('解析存储的用户信息失败:', e);
            localStorage.removeItem('currentUser');
            navigateTo('/login');
        }
    } else {
        navigateTo('/login');
    }
}

// 处理登录
async function handleLogin(e) {
    if (e) e.preventDefault();
    
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
            // 保存用户信息并跳转
            currentUser = data;
            localStorage.setItem('currentUser', JSON.stringify(data));
            navigateTo('/');
        } else {
            showToast('登录失败', data.error || '用户名或密码错误');
        }
    } catch (error) {
        console.error('登录请求失败:', error);
        showToast('登录失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 处理注册
async function handleRegister(e) {
    if (e) e.preventDefault();
    
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
            navigateTo('/login');
        } else {
            showToast('注册失败', data.error || '注册失败，请稍后重试');
        }
    } catch (error) {
        console.error('注册请求失败:', error);
        showToast('注册失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 处理退出登录
function handleLogout(e) {
    if (e) e.preventDefault();
    
    // 清除用户信息
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // 重置全局状态
    currentAreaId = null;
    currentStallId = null;
    
    // 跳转到登录页
    navigateTo('/login');
    showToast('成功', '您已成功退出登录');
}

// 加载首页内容
async function loadHomePage() {
    showLoading();
    try {
        // 获取热门区域
        const areaResponse = await fetch('http://localhost:8080/areas');
        if (areaResponse.ok) {
            const areas = await areaResponse.json();
            displayAreas(areas);
        }
        
        // 获取热门档口
        const stallResponse = await fetch('http://localhost:8080/stalls/popular');
        if (stallResponse.ok) {
            const stalls = await stallResponse.json();
            displayPopularStalls(stalls);
        }
    } catch (error) {
        console.error('加载首页数据失败:', error);
        showToast('加载失败', '获取数据失败，请刷新页面重试');
    } finally {
        hideLoading();
    }
}

// 显示区域列表
function displayAreas(areas) {
    const areaList = document.getElementById('area-list');
    areaList.innerHTML = '';
    
    if (areas && areas.length > 0) {
        areas.forEach(area => {
            const card = createAreaCard(area);
            areaList.appendChild(card);
        });
    } else {
        areaList.innerHTML = '<p class="text-center">暂无区域数据</p>';
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
        navigateTo(`/areas/${area.id}`);
    });
    return div;
}

// 显示热门档口
function displayPopularStalls(stalls) {
    const stallList = document.getElementById('popular-stalls');
    stallList.innerHTML = '';
    
    if (stalls && stalls.length > 0) {
        stalls.forEach(stall => {
            const card = createStallCard(stall);
            stallList.appendChild(card);
        });
    } else {
        stallList.innerHTML = '<p class="text-center">暂无热门档口</p>';
    }
}

// 创建档口卡片
function createStallCard(stall) {
    const div = document.createElement('div');
    div.className = 'card';
    
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
        navigateTo(`/stalls/${stall.id}`);
    });
    return div;
}

// 加载区域详情
async function loadAreaDetails(areaId) {
    if (!areaId) return;
    
    showLoading();
    try {
        // 获取区域信息
        const areaResponse = await fetch(`http://localhost:8080/areas/${areaId}`);
        if (areaResponse.ok) {
            const area = await areaResponse.json();
            document.getElementById('area-detail-name').textContent = area.name;
        } else {
            document.getElementById('area-detail-name').textContent = `区域 ${areaId}`;
        }
        
        // 获取区域下的档口
        const stallsResponse = await fetch(`http://localhost:8080/stalls?area_id=${areaId}`);
        if (stallsResponse.ok) {
            const stalls = await stallsResponse.json();
            displayStalls(stalls);
        }
    } catch (error) {
        console.error('加载区域详情失败:', error);
        showToast('加载失败', '获取区域详情失败');
    } finally {
        hideLoading();
    }
}

// 显示档口列表
function displayStalls(stalls) {
    const stallList = document.getElementById('stall-list');
    stallList.innerHTML = '';
    
    if (stalls && stalls.length > 0) {
        stalls.forEach(stall => {
            const card = createStallCard(stall);
            stallList.appendChild(card);
        });
    } else {
        stallList.innerHTML = '<p class="text-center">该区域暂无档口</p>';
    }
}

// 加载档口详情
async function loadStallDetails(stallId) {
    if (!stallId) return;
    
    showLoading();
    try {
        // 获取档口信息
        const stallResponse = await fetch(`http://localhost:8080/stalls/${stallId}`);
        if (stallResponse.ok) {
            const stall = await stallResponse.json();
            document.getElementById('stall-detail-name').textContent = stall.name;
            updateStallRating(stall);
        } else {
            document.getElementById('stall-detail-name').textContent = `档口 ${stallId}`;
        }
        
        // 获取档口点评
        const reviewsResponse = await fetch(`http://localhost:8080/reviews?stall_id=${stallId}`);
        if (reviewsResponse.ok) {
            const reviews = await reviewsResponse.json();
            displayReviews(reviews);
        }
        
        // 检查收藏状态并更新按钮
        updateFavoriteButton(stallId);
    } catch (error) {
        console.error('加载档口详情失败:', error);
        showToast('加载失败', '获取档口详情失败');
    } finally {
        hideLoading();
    }
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

// 显示点评列表
function displayReviews(reviews) {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    
    if (reviews && reviews.length > 0) {
        reviews.forEach(review => {
            const reviewItem = createReviewItem(review);
            reviewList.appendChild(reviewItem);
        });
    } else {
        reviewList.innerHTML = '<p class="text-center">暂无点评</p>';
    }
}

// 创建点评项
function createReviewItem(review) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    const userInitial = review.username ? review.username.charAt(0).toUpperCase() : '匿';
    const date = new Date(review.created_at);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
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

// 加载我的点评
async function loadMyReviews() {
    if (!currentUser) return;
    
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/reviews?user_id=${currentUser.id}`);
        if (response.ok) {
            const reviews = await response.json();
            displayMyReviews(reviews);
        }
    } catch (error) {
        console.error('加载我的点评失败:', error);
        showToast('加载失败', '获取点评数据失败');
    } finally {
        hideLoading();
    }
}

// 显示我的点评
function displayMyReviews(reviews) {
    const reviewList = document.getElementById('my-review-list');
    reviewList.innerHTML = '';
    
    if (reviews && reviews.length > 0) {
        reviews.forEach(review => {
            const reviewItem = createReviewItem(review);
            reviewList.appendChild(reviewItem);
        });
    } else {
        reviewList.innerHTML = '<p class="text-center my-5">您还没有发表过点评</p>';
    }
}

// 加载我的收藏
async function loadMyFavorites() {
    if (!currentUser) return;
    
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/favorites?user_id=${currentUser.id}`);
        if (response.ok) {
            const favorites = await response.json();
            displayMyFavorites(favorites);
        }
    } catch (error) {
        console.error('加载我的收藏失败:', error);
        showToast('加载失败', '获取收藏数据失败');
    } finally {
        hideLoading();
    }
}

// 显示我的收藏
function displayMyFavorites(favorites) {
    const favoriteList = document.getElementById('my-favorite-list');
    favoriteList.innerHTML = '';
    
    if (favorites && favorites.length > 0) {
        favorites.forEach(favorite => {
            if (favorite.stall) {
                const card = createStallCard(favorite.stall);
                favoriteList.appendChild(card);
            }
        });
    } else {
        favoriteList.innerHTML = '<p class="text-center my-5">您还没有收藏任何档口</p>';
    }
}

// 加载个人资料页面
async function loadProfilePage() {
    if (!currentUser) return;
    
    document.getElementById('profile-username').textContent = currentUser.username;
    
    // 设置头像
    const initial = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profile-avatar').textContent = initial;
    
    // 获取用户统计数据
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/users/${currentUser.id}/stats`);
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('review-count').textContent = stats.review_count || 0;
            document.getElementById('favorite-count').textContent = stats.favorite_count || 0;
        }
    } catch (error) {
        console.error('获取用户统计数据失败:', error);
    } finally {
        hideLoading();
    }
}

// 执行搜索
async function performSearch(keyword) {
    if (!keyword.trim()) return;
    
    showLoading();
    try {
        const response = await fetch(`http://localhost:8080/search?keyword=${encodeURIComponent(keyword)}`);
        if (response.ok) {
            const results = await response.json();
            displaySearchResults(results, keyword);
        }
    } catch (error) {
        console.error('搜索失败:', error);
        showToast('搜索失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 显示搜索结果
function displaySearchResults(results, keyword) {
    document.getElementById('search-query').textContent = `搜索: ${keyword}`;
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    
    let hasResults = false;
    
    if (results.areas && results.areas.length > 0) {
        hasResults = true;
        const areaTitle = document.createElement('h3');
        areaTitle.textContent = '区域';
        searchResults.appendChild(areaTitle);
        
        results.areas.forEach(area => {
            const card = createAreaCard(area);
            searchResults.appendChild(card);
        });
    }
    
    if (results.stalls && results.stalls.length > 0) {
        hasResults = true;
        const stallTitle = document.createElement('h3');
        stallTitle.className = 'mt-4';
        stallTitle.textContent = '档口';
        searchResults.appendChild(stallTitle);
        
        results.stalls.forEach(stall => {
            const card = createStallCard(stall);
            searchResults.appendChild(card);
        });
    }
    
    if (!hasResults) {
        searchResults.innerHTML = '<p class="text-center my-5">没有找到相关结果</p>';
    }
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
                const starRating = parseInt(s.getAttribute('data-rating'));
                if (starRating <= rating) {
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill', 'active');
                } else {
                    s.classList.remove('bi-star-fill', 'active');
                    s.classList.add('bi-star');
                }
            });
            
            document.getElementById('selected-rating').textContent = rating;
        });
    });
}

// 重置评分
function resetRating() {
    currentRating = 0;
    document.getElementById('selected-rating').textContent = '0';
    
    const ratingStars = document.querySelectorAll('.rating-star');
    ratingStars.forEach(star => {
        star.classList.remove('bi-star-fill', 'active');
        star.classList.add('bi-star');
    });
    
    // 清空点评内容
    document.getElementById('review-content').value = '';
}

// 提交点评
async function submitReview(e) {
    if (e) e.preventDefault();
    
    if (!currentUser) {
        showToast('提交失败', '请先登录');
        return;
    }
    
    const content = document.getElementById('review-content').value;
    
    if (!content) {
        showToast('提交失败', '请填写点评内容');
        return;
    }
    
    if (currentRating === 0) {
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
                area_id: currentStallId ? null : currentAreaId,
                content: content,
                rating: currentRating
            })
        });
        
        if (response.ok) {
            showToast('提交成功', '您的点评已提交');
            resetRating();
            
            // 返回之前的页面
            if (currentStallId) {
                navigateTo(`/stalls/${currentStallId}`);
            } else if (currentAreaId) {
                navigateTo(`/areas/${currentAreaId}`);
            } else {
                navigateTo('/');
            }
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
}

// 更新收藏按钮状态
async function updateFavoriteButton(stallId) {
    if (!currentUser || !stallId) return;
    
    try {
        const response = await fetch(`http://localhost:8080/favorites?user_id=${currentUser.id}&stall_id=${stallId}`);
        if (response.ok) {
            const favorites = await response.json();
            const isFavorited = favorites && favorites.length > 0;
            const favoriteBtn = document.getElementById('favorite-button');
            
            if (isFavorited) {
                favoriteBtn.innerHTML = '<i class="bi bi-heart-fill"></i> 已收藏';
                favoriteBtn.classList.add('btn-danger');
                favoriteBtn.classList.remove('btn-outline-danger');
            } else {
                favoriteBtn.innerHTML = '<i class="bi bi-heart"></i> 收藏';
                favoriteBtn.classList.add('btn-outline-danger');
                favoriteBtn.classList.remove('btn-danger');
            }
        }
    } catch (error) {
        console.error('获取收藏状态失败:', error);
    }
}

// 切换收藏状态
async function toggleFavorite(e) {
    if (e) e.preventDefault();
    
    if (!currentUser || !currentStallId) {
        showToast('收藏失败', '请先登录');
        return;
    }
    
    showLoading();
    try {
        // 先检查是否已收藏
        const checkResponse = await fetch(`http://localhost:8080/favorites?user_id=${currentUser.id}&stall_id=${currentStallId}`);
        if (checkResponse.ok) {
            const favorites = await checkResponse.json();
            const isFavorited = favorites && favorites.length > 0;
            
            if (isFavorited) {
                // 取消收藏
                const deleteResponse = await fetch(`http://localhost:8080/favorites/${favorites[0].id}`, {
                    method: 'DELETE'
                });
                
                if (deleteResponse.ok) {
                    showToast('成功', '已取消收藏');
                }
            } else {
                // 添加收藏
                const addResponse = await fetch('http://localhost:8080/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: currentUser.id,
                        stall_id: currentStallId
                    })
                });
                
                if (addResponse.ok) {
                    showToast('成功', '已添加到收藏');
                }
            }
            
            // 更新按钮状态
            updateFavoriteButton(currentStallId);
        }
    } catch (error) {
        console.error('操作收藏失败:', error);
        showToast('操作失败', '网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 更新用户头像
function updateUserAvatar() {
    if (!currentUser) return;
    
    const initial = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('nav-user-avatar').textContent = initial;
}

// 显示星星
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

// 
function initReviewPage(param) {
    // 重置评分
    resetRating();
    
    // 设置点评目标名称
    const targetName = param.name || '点评';
    document.getElementById('review-target-name').textContent = targetName;
    
    // 显示点评页面
    showPage('review-page');
    
    // 更新当前区域或档口ID
    if (param.area_id) {
        currentAreaId = param.area_id;
        currentStallId = null;
    } else if (param.stall_id) {
        currentStallId = param.stall_id;
        currentAreaId = null;
    }
}