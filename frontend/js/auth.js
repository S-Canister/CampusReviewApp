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

// 更新用户头像
function updateUserAvatar() {
    if (!currentUser) return;
    
    const initial = currentUser.username.charAt(0).toUpperCase();
    if (document.getElementById('nav-user-avatar')) {
        document.getElementById('nav-user-avatar').textContent = initial;
    }
}
