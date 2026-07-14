// ========== تقييماتي - Firebase ==========
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser || currentUser.type !== 'tech') {
        window.location.href = 'index.html';
        return;
    }

    loadRatings();

    document.getElementById('filterRating')?.addEventListener('change', loadRatings);
    document.getElementById('sortRatings')?.addEventListener('change', loadRatings);
});

function getRatingsRef() {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    return db.ref('ratings').orderByChild('techId').equalTo(currentUser.id);
}

function loadRatings() {
    getRatingsRef().once('value').then(snapshot => {
        const ratings = [];
        snapshot.forEach(child => {
            ratings.push({ id: child.key, ...child.val() });
        });
        renderRatings(ratings);
        updateSummary(ratings);
    });
}

function renderRatings(ratings) {
    const filterRating = document.getElementById('filterRating')?.value || 'all';
    const sortBy = document.getElementById('sortRatings')?.value || 'newest';

    let filtered = ratings;
    if (filterRating !== 'all') {
        filtered = ratings.filter(r => r.rating === parseInt(filterRating));
    }

    switch (sortBy) {
        case 'oldest':
            filtered.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            break;
        case 'highest':
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'lowest':
            filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;
        default: // newest
            filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    const list = document.getElementById('ratingsList');
    const empty = document.getElementById('emptyState');

    if (filtered.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = filtered.map(r => createRatingCard(r)).join('');
    }
}

function createRatingCard(rating) {
    const stars = '⭐'.repeat(rating.rating || 0) + '☆'.repeat(5 - (rating.rating || 0));
    const date = rating.createdAt ? new Date(rating.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : '—';

    let badgeClass = '', badgeText = '';
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

function updateSummary(ratings) {
    const total = ratings.length;
    document.getElementById('totalRatings').textContent = total;

    if (total > 0) {
        const avg = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
        document.getElementById('overallRating').textContent = avg.toFixed(1);
        const fullStars = Math.round(avg);
        document.getElementById('overallStars').textContent = '⭐'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    } else {
        document.getElementById('overallRating').textContent = '0.0';
        document.getElementById('overallStars').textContent = '☆☆☆☆☆';
    }

    document.getElementById('overallCount').textContent = `${total} تقييم`;

    for (let i = 1; i <= 5; i++) {
        const count = ratings.filter(r => r.rating === i).length;
        document.getElementById(`count${i}`).textContent = count;
        document.getElementById(`bar${i}`).style.width = total > 0 ? (count / total * 100) + '%' : '0%';
    }

    // يمكن حساب المكتملة والتعليقات من الطلبات المكتملة للفني
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    db.ref('orders').orderByChild('selectedTechId').equalTo(currentUser.id).once('value').then(snapshot => {
        let completed = 0, comments = 0, satisfied = 0;
        snapshot.forEach(child => {
            const order = child.val();
            if (order.status === 'completed') completed++;
            if (order.rated) {
                comments++;
                if (order.rating >= 4) satisfied++;
            }
        });
        document.getElementById('totalCompleted').textContent = completed;
        document.getElementById('totalComments').textContent = comments;
        document.getElementById('satisfactionRate').textContent = total > 0 ? Math.round(satisfied / total * 100) + '%' : '0%';
    });
}

function getDeviceIcon(type) {
    const icons = { fridge:'❄️', washer:'🌀', tv:'📺', ac:'🌬️', oven:'🔥', microwave:'📡', 'water-heater':'💧', dishwasher:'🍽️', car:'🚗', motorcycle:'🏍️', other:'📦' };
    return icons[type] || '📦';
}

function logout() {
    localStorage.removeItem('shakhesly_current_user');
    window.location.href = 'index.html';
}
