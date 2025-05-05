// 全局变量
let currentUser;

// 显示指定页面
function showPage(pageId) {
    const pages = document.querySelectorAll('div[id$="-page"]');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

// 登录逻辑
document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
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
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('登录失败:', error);
    }
});

// 注册逻辑
document.getElementById('register-button').addEventListener('click', () => {
    showPage('register-page');
});

document.getElementById('submit-register-button').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
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
            alert('注册成功，请登录');
            showPage('login-page');
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('注册失败:', error);
    }
});

// 获取所有区域
async function getAreas() {
    try {
        const response = await fetch('http://localhost:8080/areas');
        const areas = await response.json();
        const areaList = document.getElementById('area-list');
        areaList.innerHTML = '';
        areas.forEach(area => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = area.name;
            a.href = '#';
            a.addEventListener('click', () => {
                showPage('area-detail-page');
                getStallsByAreaId(area.id);
                document.getElementById('area-detail-name').textContent = area.name;
            });
            li.appendChild(a);
            areaList.appendChild(li);
        });
    } catch (error) {
        console.error('获取区域失败:', error);
    }
}

// 根据区域 ID 获取档口
async function getStallsByAreaId(areaId) {
    try {
        const response = await fetch(`http://localhost:8080/stalls?area_id=${areaId}`);
        const stalls = await response.json();
        const stallList = document.getElementById('stall-list');
        stallList.innerHTML = '';
        stalls.forEach(stall => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = stall.name;
            a.href = '#';
            a.addEventListener('click', () => {
                showPage('stall-detail-page');
                getReviewsByStallId(stall.id);
                document.getElementById('stall-detail-name').textContent = stall.name;
            });
            li.appendChild(a);
            stallList.appendChild(li);
        });
    } catch (error) {
        console.error('获取档口失败:', error);
    }
}

// 根据档口 ID 获取点评
async function getReviewsByStallId(stallId) {
    try {
        const response = await fetch(`http://localhost:8080/reviews?stall_id=${stallId}`);
        const reviews = await response.json();
        const reviewList = document.getElementById('review-list');
        reviewList.innerHTML = '';
        reviews.forEach(review => {
            const li = document.createElement('li');
            li.textContent = review.content;
            reviewList.appendChild(li);
        });
    } catch (error) {
        console.error('获取点评失败:', error);
    }
}

// 提交点评
document.getElementById('submit-review-button').addEventListener('click', async () => {
    const content = document.getElementById('review-content').value;
    const stallId = currentStallId;
    try {
        const response = await fetch('http://localhost:8080/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: currentUser.id, stall_id: stallId, content })
        });
        if (response.ok) {
            alert('点评提交成功');
            showPage('stall-detail-page');
            getReviewsByStallId(stallId);
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('点评提交失败:', error);
    }
});

// 收藏档口
document.getElementById('favorite-button').addEventListener('click', async () => {
    const stallId = currentStallId;
    try {
        const response = await fetch('http://localhost:8080/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: currentUser.id, stall_id: stallId })
        });
        if (response.ok) {
            alert('收藏成功');
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('收藏失败:', error);
    }
});

// 退出登录
document.getElementById('logout-button').addEventListener('click', () => {
    currentUser = null;
    showPage('login-page');
});    