// 全局变量
let currentUser = null;
let currentAreaId = null;
let currentStallId = null;
let currentRating = 0;

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    console.log('应用启动...');
    
    // 初始化路由
    initRouter();
    
    // 绑定导航事件
    bindNavigationEvents();
    
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化后立即添加调试函数
    window.setTimeout(function() {
        // 强制显示底部导航栏（如果已登录）
        if (currentUser) {
            const bottomNav = document.getElementById('bottom-nav');
            bottomNav.setAttribute('style', 'display: flex !important');
            console.log('已强制显示底部导航栏');
            
            // 检查计算样式
            const computedStyle = window.getComputedStyle(bottomNav);
            console.log('底部导航栏计算样式:', computedStyle.display);
        }
    }, 1000);
    
    console.log('初始化完成');
});

// 绑定导航事件
function bindNavigationEvents() {
    // 绑定全局导航事件
    
    // 底部导航
    const navItems = document.querySelectorAll('#bottom-nav .nav-link');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.getAttribute('href').substring(1));
        });
    });
    
    // 顶部导航品牌
    const navBrand = document.querySelector('.navbar-brand');
    if (navBrand) {
        navBrand.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('/');
        });
    }
    
    // 搜索功能
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const keyword = document.getElementById('search-input').value;
            if (keyword.trim()) {
                navigateTo(`/search?q=${encodeURIComponent(keyword)}`);
            } else {
                showToast('搜索', '请输入搜索关键词');
            }
        });
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const keyword = searchInput.value;
                if (keyword.trim()) {
                    navigateTo(`/search?q=${encodeURIComponent(keyword)}`);
                }
            }
        });
    }
}

// 加载首页内容
function loadHomePage() {
    console.log('加载首页内容...');
    
    showLoading();
    
    // 获取热门区域
    apiGetAreas()
        .then(areas => {
            console.log('区域数据:', areas);
            displayAreas(areas);
        })
        .catch(error => {
            console.error('获取区域失败:', error);
            showToast('加载失败', '获取区域数据失败');
        });
    
    // 获取热门档口
    apiGetPopularStalls()
        .then(stalls => {
            console.log('热门档口数据:', stalls);
            displayPopularStalls(stalls);
        })
        .catch(error => {
            console.error('获取热门档口失败:', error);
            showToast('加载失败', '获取热门档口数据失败');
        })
        .finally(() => {
            hideLoading();
        });
}

// 显示区域列表
function displayAreas(areas) {
    const areaList = document.getElementById('area-list');
    if (!areaList) {
        console.error('找不到区域列表元素');
        return;
    }
    
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
    if (!stallList) {
        console.error('找不到热门档口列表元素');
        return;
    }
    
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

// 断点调试函数
function debugUI() {
    console.log('----------调试信息----------');
    console.log('当前用户:', currentUser);
    console.log('当前路由:', currentRoute);
    console.log('底部导航显示:', document.getElementById('bottom-nav').style.display);
    console.log('顶部导航显示:', document.getElementById('top-nav').style.display);
    console.log('当前URL:', window.location.hash);
    console.log('主容器内容:', document.getElementById('main-container').innerHTML.substring(0, 100) + '...');
    console.log('--------------------------');
}

// 暴露debugUI方法到全局，便于控制台调试
window.debugUI = debugUI;
