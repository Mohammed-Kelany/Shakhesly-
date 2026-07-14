// ========== طلباتي - Firebase ==========
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    let currentFilter = 'all';
    let currentRatingOrderId = null;
    let currentRating = 0;

    loadOrders();

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            loadOrders();
        });
    });

    document.getElementById('modalCloseRating')?.addEventListener('click', closeRatingModal);
    document.getElementById('ratingModal')?.addEventListener('click', function (e) { if (e.target === this) closeRatingModal(); });
    document.getElementById('modalCloseDetail')?.addEventListener('click', closeDetailModal);
    document.getElementById('detailModal')?.addEventListener('click', function (e) { if (e.target === this) closeDetailModal(); });

    document.querySelectorAll('#starsRating span').forEach(star => {
        star.addEventListener('click', function () {
            currentRating = parseInt(this.getAttribute('data-star'));
            updateStars();
            const texts = ['', 'سيئ 😞', 'مقبول 😐', 'جيد 🙂', 'جيد جداً 😊', 'ممتاز 🤩'];
            document.getElementById('ratingText').textContent = texts[currentRating];
        });
    });

    document.getElementById('btnSubmitRating')?.addEventListener('click', submitRating);
});

// ========== دوال Firebase ==========
function getUserOrdersRef() {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    return db.ref('orders').orderByChild('userId').equalTo(currentUser.id);
}

function loadOrders() {
    getUserOrdersRef().once('value').then(snapshot => {
        const orders = [];
        snapshot.forEach(child => {
            orders.push({ id: child.key, ...child.val() });
        });
        renderOrders(orders);
        updateStats(orders);
    });
}

function renderOrders(orders) {
    const currentFilter = document.querySelector('.tab.active')?.getAttribute('data-filter') || 'all';
    let filtered = orders;
    if (currentFilter !== 'all') {
        filtered = orders.filter(o => o.status === currentFilter);
    }
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const list = document.getElementById('ordersList');
    const empty = document.getElementById('emptyState');

    if (filtered.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = filtered.map(order => createOrderCard(order)).join('');
        filtered.forEach(order => {
            document.getElementById(`detail-${order.id}`)?.addEventListener('click', () => openDetailModal(order));
            document.getElementById(`cancel-${order.id}`)?.addEventListener('click', () => cancelOrder(order.id));
            document.getElementById(`rate-${order.id}`)?.addEventListener('click', () => openRatingModal(order.id));
        });
    }
}

function createOrderCard(order) {
    const statusInfo = getStatusInfo(order.status);
    const deviceIcon = getDeviceIcon(order.deviceType);
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : '—';

    let bidsHTML = '';
    let actions = '';

    if (order.status === 'pending' && order.bids && order.bids.length > 0) {
        bidsHTML = '<div style="margin:10px 0;"><strong>📊 العروض المقدمة (' + order.bids.length + '):</strong></div>';
        order.bids.forEach(bid => {
            bidsHTML += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#F1F5F9;border-radius:8px;margin:5px 0;">
                    <span>👨‍🔧 ${bid.techName}</span>
                    <span style="font-weight:800;color:#2563EB;">💰 ${bid.price} ج.م</span>
                    <button class="btn btn-primary btn-sm" onclick="selectBid('${order.id}', '${bid.techId}', '${bid.techName}', ${bid.price})">✅ اختيار</button>
                </div>
            `;
        });
    } else if (order.status === 'accepted') {
        bidsHTML = `<div style="margin:10px 0;color:#10B981;font-weight:700;">✅ تم اختيار ${order.techName} - السعر: ${order.price} ج.م</div>`;
    }

    if (order.status === 'pending' && (!order.bids || order.bids.length === 0)) {
        actions = `<button class="btn btn-danger btn-sm" id="cancel-${order.id}">❌ إلغاء</button>`;
    } else if (order.status === 'completed' && !order.rated) {
        actions = `<button class="btn btn-primary btn-sm" id="rate-${order.id}">⭐ تقييم</button>`;
    } else if (order.status === 'accepted') {
        actions = `<a href="chat.html?orderId=${order.id}&userId=${order.selectedTechId}&name=${encodeURIComponent(order.techName || 'الفني')}&type=tech" class="btn btn-outline btn-sm">💬 محادثة</a>`;
    }

    return `
    <div class="order-card">
        <div class="order-info">
            <div class="order-device">${deviceIcon} ${order.deviceName || 'جهاز'}</div>
            <div class="order-meta">
                <span>📅 ${date}</span>
                <span>🛠️ ${order.problem ? order.problem.substring(0, 40) + '...' : 'مشكلة غير محددة'}</span>
            </div>
            ${bidsHTML}
        </div>
        <span class="order-status ${statusInfo.class}">${statusInfo.icon} ${statusInfo.text}</span>
        <div class="order-actions">
            <button class="btn btn-outline btn-sm" id="detail-${order.id}">🔍 تفاصيل</button>
            ${actions}
        </div>
    </div>`;
}

// ========== اختيار عرض الفني ==========
window.selectBid = function(orderId, techId, techName, price) {
    if (!confirm(`هل أنت متأكد من اختيار ${techName} بسعر ${price} ج.م؟`)) return;

    const updates = {
        status: 'accepted',
        selectedTechId: techId,
        techName: techName,
        price: price
    };

    db.ref('orders/' + orderId).update(updates).then(() => {
        // إرسال إشعار للفني
        addNotificationToUser(techId, '🎯 تم اختيارك', `العميل اختار عرضك (${price} ج.م) لصيانة الجهاز.`, 'order', 'incoming-orders.html');
        loadOrders();
        showNotification('تم اختيار الفني بنجاح! 🎯', 'success');
    });
};

// ========== تفاصيل الطلب ==========
function openDetailModal(order) {
    const statusInfo = getStatusInfo(order.status);
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    document.getElementById('detailTitle').textContent = `📋 تفاصيل الطلب #${order.id}`;
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-item"><span class="label">الجهاز</span><span class="value">${getDeviceIcon(order.deviceType)} ${order.deviceName || '-'}</span></div>
        <div class="detail-item"><span class="label">المشكلة</span><span class="value">${order.problem || '-'}</span></div>
        <div class="detail-item"><span class="label">الفني</span><span class="value">${order.techName || 'في انتظار التعيين'}</span></div>
        <div class="detail-item"><span class="label">الحالة</span><span class="value">${statusInfo.icon} ${statusInfo.text}</span></div>
        <div class="detail-item"><span class="label">تاريخ الطلب</span><span class="value">${date}</span></div>
        ${order.price ? `<div class="detail-item"><span class="label">السعر</span><span class="value">${order.price} ج.م</span></div>` : ''}
        ${order.rating ? `<div class="detail-item"><span class="label">تقييمك</span><span class="value">${'⭐'.repeat(order.rating)}</span></div>` : ''}
    `;
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ========== إلغاء الطلب ==========
function cancelOrder(orderId) {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    db.ref('orders/' + orderId).update({ status: 'cancelled' }).then(() => {
        loadOrders();
        showNotification('تم إلغاء الطلب', 'warning');
    });
}

// ========== نافذة التقييم ==========
function openRatingModal(orderId) {
    currentRatingOrderId = orderId;
    currentRating = 0;
    updateStars();
    document.getElementById('ratingText').textContent = 'اختر تقييمك';
    document.getElementById('ratingComment').value = '';
    document.getElementById('ratingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRatingModal() {
    document.getElementById('ratingModal').classList.remove('active');
    document.body.style.overflow = '';
}

function updateStars() {
    document.querySelectorAll('#starsRating span').forEach(star => {
        const starValue = parseInt(star.getAttribute('data-star'));
        star.classList.toggle('active', starValue <= currentRating);
    });
}

function submitRating() {
    if (currentRating === 0) { alert('الرجاء اختيار تقييم'); return; }
    const comment = document.getElementById('ratingComment').value.trim();
    db.ref('orders/' + currentRatingOrderId).update({
        rated: true,
        rating: currentRating,
        ratingComment: comment
    }).then(() => {
        closeRatingModal();
        loadOrders();
        showNotification('شكراً لتقييمك! ⭐', 'success');
    });
}

// ========== تحديث الإحصائيات ==========
function updateStats(orders) {
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('inProgressOrders').textContent = orders.filter(o => o.status === 'accepted' || o.status === 'in-progress').length;
    document.getElementById('completedOrders').textContent = orders.filter(o => o.status === 'completed').length;
}

// ========== دوال مساعدة ==========
function getStatusInfo(status) {
    const map = {
        'pending': { text: 'قيد الانتظار', icon: '⏳', class: 'status-pending' },
        'accepted': { text: 'مقبول', icon: '✅', class: 'status-accepted' },
        'in-progress': { text: 'قيد التنفيذ', icon: '🔧', class: 'status-in-progress' },
        'completed': { text: 'مكتمل', icon: '✔️', class: 'status-completed' },
        'cancelled': { text: 'ملغي', icon: '❌', class: 'status-cancelled' }
    };
    return map[status] || map['pending'];
}

function getDeviceIcon(type) {
    const icons = { fridge: '❄️', washer: '🌀', tv: '📺', ac: '🌬️', oven: '🔥', microwave: '📡', 'water-heater': '💧', dishwasher: '🍽️', car: '🚗', motorcycle: '🏍️', other: '📦' };
    return icons[type] || '📦';
}

function addNotificationToUser(userId, title, message, type, link) {
    if (!userId) return;
    db.ref('notifications').push({
        userId: userId,
        title: title,
        message: message,
        type: type || 'system',
        link: link || null,
        read: false,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    });
}

function logout() { localStorage.removeItem('shakhesly_current_user'); window.location.href = 'index.html'; }

function showNotification(msg, type) {
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#2563EB';
    const n = document.createElement('div');
    n.textContent = msg;
    Object.assign(n.style, { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', background: bg, color: 'white', padding: '12px 24px', borderRadius: '50px', zIndex: '9999', fontWeight: 'bold' });
    document.body.appendChild(n);
    setTimeout(() => { n.remove(); }, 3000);
}
