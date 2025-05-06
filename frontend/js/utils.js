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
