/* ============================================
   شخصلي AI - تفاعلات صفحة تقييماتي للفني
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // التحقق من تسجيل الدخول كفني
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser || currentUser.type !== 'tech') {
        window.location.href = 'index.html';
        return;
    }

    // تحميل التقييمات
    loadRatings();

    // فلترة وترتيب
    document.getElementById('filterRating').addEventListener('change', loadRatings);
    document.getElementById('sortRatings').addEventListener('change', loadRatings);
});

/* ==============================
   جلب التقييمات
   ============================== */
function getRatings() {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const allOrders = JSON.parse(localStorage.getItem('shakhesly_orders')) || [];
    
    // الطلبات المكتملة اللي للفني ده وفيها تقييم
    return allOrders.filter(o => 
        o.techId === currentUser.id && 
        o.rated === true
    );
}

/* ==============================
   تحميل وعرض التقييمات
   ============================== */
function loadRatings() {
    let ratings = getRatings();
    
    const filterRating = document.getElementById('filterRating').value;
    const sortBy = document.getElementById('sortRatings').value;
    
    // فلترة
    if (filterRating !== 'all') {
        ratings = ratings.filter(r => r.rating === parseInt(filterRating));
    }
    
    // ترتيب
    switch(sortBy) {
        case 'oldest':
            ratings.sort((a, b) => a.id - b.id);
            break;
        case 'highest':
            ratings.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            ratings.sort((a, b) => a.rating - b.rating);
            break;
        default: // newest
            ratings.sort((a, b) => b.id - a.id);
    }
    
    const list = document.getElementById('ratingsList');
    const empty = document.getElementById('emptyState');
    
    if (ratings.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = ratings.map(rating => createRatingCard(rating)).join('');
    }
    
    updateSummary(ratings);
}

/* ==============================
   إنشاء كرت التقييم
   ============================== */
function createRatingCard(rating) {
    const stars = '⭐'.repeat(rating.rating) + '☆'.repeat(5 - rating.rating);
    const date = new Date(rating.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    let badgeClass = '';
    let badgeText = '';
    
    if (rating.rating >= 5) { badgeClass = 'badge-excellent'; badgeText = 'ممتاز'; }
    else if (rating.rating >= 4) { badgeClass = 'badge-good'; badgeText = 'جيد جداً'; }
    else if (rating.rating >= 3) { badgeClass = 'badge-average'; badgeText = 'متوسط'; }
    else { badgeClass = 'badge-poor'; badgeText = 'ضعيف'; }
    
    const deviceIcon = getDeviceIcon(rating.deviceType);
    
    return `
        <div class="rating-card">
            <div class="rating-header">
                <div>
                    <div class="rating-stars">${stars}</div>
                    <div class="rating-customer">👤 ${rating.customerName || 'عميل'}</div>
                    <div class="rating-device">${deviceIcon} ${rating.deviceName || 'جهاز'} | 💰 ${rating.price || 0} ج.م</div>
                </div>
                <div style="text-align:left;">
                    <span class="badge ${badgeClass}">${badgeText}</span>
                    <div class="rating-date">📅 ${date}</div>
                </div>
            </div>
            <div class="rating-comment ${!rating.ratingComment ? 'empty' : ''}">
                ${rating.ratingComment || 'لم يترك العميل تعليقاً'}
            </div>
        </div>
    `;
}

/* ==============================
   تحديث الملخص
   ============================== */
function updateSummary(ratings) {
    const allRatings = getRatings();
    
    // إجمالي التقييمات
    const total = allRatings.length;
    document.getElementById('totalRatings').textContent = total;
    
    // المتوسط
    if (total > 0) {
        const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / total;
        document.getElementById('overallRating').textContent = avg.toFixed(1);
        
        // النجوم
        const fullStars = Math.round(avg);
        document.getElementById('overallStars').textContent = '⭐'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    } else {
        document.getElementById('overallRating').textContent = '0.0';
        document.getElementById('overallStars').textContent = '☆☆☆☆☆';
    }
    
    document.getElementById('overallCount').textContent = `${total} تقييم`;
    
    // الأعمدة
    for (let i = 1; i <= 5; i++) {
        const count = allRatings.filter(r => r.rating === i).length;
        document.getElementById(`count${i}`).textContent = count;
        document.getElementById(`bar${i}`).style.width = total > 0 ? (count / total * 100) + '%' : '0%';
    }
    
    // إحصائيات
    document.getElementById('totalCompleted').textContent = JSON.parse(localStorage.getItem('shakhesly_orders') || '[]')
        .filter(o => o.techId === JSON.parse(localStorage.getItem('shakhesly_current_user')).id && o.status === 'completed').length;
    
    document.getElementById('totalComments').textContent = allRatings.filter(r => r.ratingComment).length;
    
    const satisfied = allRatings.filter(r => r.rating >= 4).length;
    document.getElementById('satisfactionRate').textContent = total > 0 ? Math.round(satisfied / total * 100) + '%' : '0%';
}

/* ==============================
   دوال مساعدة
   ============================== */
function getDeviceIcon(type) {
    const icons = {
        fridge: '❄️', washer: '🌀', tv: '📺', ac: '🌬️',
        oven: '🔥', microwave: '📡', 'water-heater': '💧',
        dishwasher: '🍽️', other: '📦'
    };
    return icons[type] || '📦';
}

function logout() {
    localStorage.removeItem('shakhesly_current_user');
    window.location.href = 'index.html';
} 

