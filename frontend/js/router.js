// 路由配置
const routes = {
    '/': 'home-page',
    '/login': 'login-page',
    '/register': 'register-page',
    '/areas/:id': 'area-detail-page',
    '/stalls/:id': 'stall-detail-page',
    '/areas/:id/review': 'review-page',
    '/stalls/:id/review': 'review-page',
    '/reviews': 'my-reviews-page',
    '/favorites': 'my-favorites-page',
    '/profile': 'profile-page',
    '/search': 'search-results-page'
};

// 全局变量
let currentRoute = null;

// 初始化路由系统
function initRouter() {
    // 监听URL变化
    window.addEventListener('hashchange', handleRouteChange);
    
    // 初始路由处理
    handleRouteChange();
}

// 处理路由变化
function handleRouteChange() {
    // 获取当前hash（去掉#号）
    let hash = window.location.hash.substr(1);
    
    // 默认路由
    if (!hash) hash = '/login';
    
    // 解析URL参数
    const [path, queryString] = hash.split('?');
    const params = {};
    
    // 处理URL参数
    if (queryString) {
        const pairs = queryString.split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            params[key] = decodeURIComponent(value || '');
        });
    }
    
    // 保存当前路由
    currentRoute = { path, params };
    
    // 先检查用户登录状态
    if (!currentUser && path !== '/login' && path !== '/register') {
        navigateTo('/login');
        return;
    }
    
    // 根据路径加载对应页面
    loadPageByPath(path, params);
    
    // 更新激活的导航项
    updateActiveNavItem(path);
}

// 根据路径加载页面 
async function loadPageByPath(path, params) {
    showLoading();
    
    try {
        let templateName = 'login';  // 默认模板
        
        // 根据路径确定要加载的模板
        if (path === '/') {
            templateName = 'home';
        } else if (path === '/register') {
            templateName = 'register';
        } else if (path === '/profile') {
            templateName = 'profile';
        } else if (path === '/reviews') {
            templateName = 'my-reviews';
        } else if (path === '/favorites') {
            templateName = 'my-favorites';
        } else if (path === '/search') {
            templateName = 'search';
        } else if (path.match(/^\/areas\/\d+$/)) {
            templateName = 'area';
            currentAreaId = path.split('/')[2];
        } else if (path.match(/^\/stalls\/\d+$/)) {
            templateName = 'stall';
            currentStallId = path.split('/')[2];
        } else if (path.match(/^\/areas\/\d+\/review$/) || path.match(/^\/stalls\/\d+\/review$/)) {
            templateName = 'review';
            
            if (path.includes('/areas/')) {
                currentAreaId = path.split('/')[2];
                currentStallId = null;
            } else {
                currentStallId = path.split('/')[2];
            }
        }
        
        console.log("加载模板:", templateName);
        
        // 加载模板内容
        const response = await fetch(`/templates/${templateName}.html`);
        
        if (response.ok) {
            const html = await response.text();
            document.getElementById('main-container').innerHTML = html;
            
            // 页面加载后初始化内容
            initPageContent(templateName, params);
            
            // 绑定页面特定事件
            bindPageEvents(templateName);
        } else {
            console.error('加载模板失败:', templateName, response.status);
            showToast('错误', `加载页面失败: ${response.status}`);
            document.getElementById('main-container').innerHTML = '<div class="text-center p-5"><h2>页面加载失败</h2><p>请刷新重试</p></div>';
        }
    } catch (error) {
        console.error('加载页面错误:', error);
        showToast('错误', '页面加载失败，请刷新重试');
        document.getElementById('main-container').innerHTML = '<div class="text-center p-5"><h2>页面加载失败</h2><p>请刷新重试</p></div>';
    } finally {
        hideLoading();
        
        // 更新页面显示状态
        updatePageVisibility();
    }
}

// 初始化页面内容
function initPageContent(templateName, params) {
    console.log("初始化页面内容:", templateName);
    
    // 加载页面数据
    switch (templateName) {
        case 'home':
            loadHomePage();
            break;
        case 'area':
            loadAreaDetails(currentAreaId);
            break;
        case 'stall':
            loadStallDetails(currentStallId);
            break;
        case 'review':
            initReviewPage(params);
            break;
        case 'my-reviews':
            loadMyReviews();
            break;
        case 'my-favorites':
            loadMyFavorites();
            break;
        case 'profile':
            loadProfilePage();
            break;
        case 'search':
            if (params.q) {
                document.getElementById('search-query').textContent = `搜索: ${params.q}`;
                performSearch(params.q);
            }
            break;
    }
}

// 更新页面显示状态
function updatePageVisibility() {
    // 显示/隐藏导航栏
    const isAuthenticated = currentUser !== null;
    document.getElementById('top-nav').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('bottom-nav').style.display = isAuthenticated ? 'flex' : 'none';
    
    // 如果已登录，更新用户头像
    if (isAuthenticated) {
        updateUserAvatar();
    }
}

// 绑定页面特定事件
function bindPageEvents(templateName) {
    console.log("绑定页面事件:", templateName);
    
    // 根据页面类型绑定不同的事件
    switch (templateName) {
        case 'login':
            document.getElementById('login-button').addEventListener('click', handleLogin);
            document.getElementById('register-button').addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('/register');
            });
            break;
        case 'register':
            document.getElementById('submit-register-button').addEventListener('click', handleRegister);
            document.getElementById('back-to-login-button').addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('/login');
            });
            break;
        case 'review':
            document.getElementById('submit-review-button').addEventListener('click', submitReview);
            initRatingSystem();
            break;
        case 'profile':
            document.getElementById('logout-button').addEventListener('click', handleLogout);
            break;
        case 'stall':
            document.getElementById('stall-review-button').addEventListener('click', (e) => {
                e.preventDefault();
                const stallName = document.getElementById('stall-detail-name').textContent;
                navigateTo(`/stalls/${currentStallId}/review?name=${encodeURIComponent(stallName)}`);
            });
            document.getElementById('favorite-button').addEventListener('click', toggleFavorite);
            break;
        case 'area':
            document.getElementById('area-review-button').addEventListener('click', (e) => {
                e.preventDefault();
                const areaName = document.getElementById('area-detail-name').textContent;
                navigateTo(`/areas/${currentAreaId}/review?name=${encodeURIComponent(areaName)}`);
            });
            break;
    }
    
    // 绑定返回按钮事件
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back();
        });
    });
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
