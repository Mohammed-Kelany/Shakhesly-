// ========== الطلبات الواردة - Firebase ==========
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser || currentUser.type !== 'tech') {
        window.location.href = 'index.html';
        return;
    }

    let currentFilter = 'all';
    let currentOrderId = null;

    loadOrders();

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            loadOrders();
        });
    });

    document.getElementById('searchOrder')?.addEventListener('input', loadOrders);
    document.getElementById('filterDevice')?.addEventListener('change', loadOrders);
    document.getElementById('modalCloseDetail')?.addEventListener('click', closeDetailModal);
    document.getElementById('detailModal')?.addEventListener('click', function (e) { if (e.target === this) closeDetailModal(); });
    document.getElementById('modalClosePrice')?.addEventListener('click', closePriceModal);
    document.getElementById('btnCancelPrice')?.addEventListener('click', closePriceModal);
    document.getElementById('priceModal')?.addEventListener('click', function (e) { if (e.target === this) closePriceModal(); });
    document.getElementById('btnConfirmPrice')?.addEventListener('click', submitBid);
});

// ========== دوال Firebase ==========
function getOrdersRef() {
    return db.ref('orders');
}

function loadOrders() {
    getOrdersRef().once('value').then(snapshot => {
        const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
        const orders = [];
        snapshot.forEach(child => {
            const order = { id: child.key, ...child.val() };
            // إظهار الطلبات التي لم يتم قبولها بعد أو التي قدم عليها الفني عرضاً
            if (order.status === 'pending' || 
                (order.bids && order.bids.some(b => b.techId === currentUser.id)) ||
                order.selectedTechId === currentUser.id) {
                orders.push(order);
            }
        });
        renderOrders(orders);
        updateStats(orders);
    });
}

function renderOrders(orders) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const searchTerm = document.getElementById('searchOrder')?.value?.toLowerCase() || '';
    const filterDevice = document.getElementById('filterDevice')?.value || 'all';
    const currentFilter = document.querySelector('.tab.active')?.getAttribute('data-filter') || 'all';

    let filtered = orders;

    // فلترة حسب التبويب
    if (currentFilter === 'pending') {
        filtered = orders.filter(o => o.status === 'pending' && (!o.bids || !o.bids.some(b => b.techId === currentUser.id)));
    } else if (currentFilter === 'bidding') {
        filtered = orders.filter(o => o.status === 'pending' && o.bids && o.bids.some(b => b.techId === currentUser.id));
    } else if (currentFilter === 'accepted') {
        filtered = orders.filter(o => o.status === 'accepted' && o.selectedTechId === currentUser.id);
    } else if (currentFilter === 'completed') {
        filtered = orders.filter(o => o.status === 'completed' && o.selectedTechId === currentUser.id);
    }

    // بحث
    if (searchTerm) {
        filtered = filtered.filter(o =>
            (o.customerName && o.customerName.toLowerCase().includes(searchTerm)) ||
            (o.deviceName && o.deviceName.toLowerCase().includes(searchTerm)) ||
            (o.problem && o.problem.toLowerCase().includes(searchTerm))
        );
    }

    // فلترة بالجهاز
    if (filterDevice !== 'all') {
        filtered = filtered.filter(o => o.deviceType === filterDevice);
    }

    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

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
            document.getElementById(`bid-${order.id}`)?.addEventListener('click', () => openBidModal(order.id));
            document.getElementById(`complete-${order.id}`)?.addEventListener('click', () => completeOrder(order.id));
        });
    }
}

function createOrderCard(order) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const hasBid = order.bids && order.bids.some(b => b.techId === currentUser.id);
    const myBid = order.bids ? order.bids.find(b => b.techId === currentUser.id) : null;
    const statusInfo = getStatusInfo(order);
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : '—';

    let actions = '';
    if (order.status === 'pending' && !hasBid) {
        actions = `<button class="btn btn-accept btn-sm" id="bid-${order.id}">💰 تقديم عرض سعر</button>`;
    } else if (order.status === 'pending' && hasBid) {
        actions = `<span style="color:var(--primary);font-weight:700;">✓ تم تقديم عرض (${myBid?.price} ج.م)</span>`;
    } else if (order.status === 'accepted' && order.selectedTechId === currentUser.id) {
        actions = `
            <button class="btn btn-primary btn-sm" id="complete-${order.id}">✔️ إكمال الصيانة</button>
            <a href="chat.html?orderId=${order.id}&userId=${order.userId}&name=${encodeURIComponent(order.customerName || 'العميل')}&type=user" class="btn btn-outline btn-sm">💬 محادثة</a>
        `;
    }

    return `
    <div class="order-card ${order.status === 'pending' && !hasBid ? 'new' : ''}">
        <div class="order-card-top">
            <div>
                <div class="order-device">${getDeviceIcon(order.deviceType)} ${order.deviceName || 'جهاز'}</div>
                <span style="color:var(--gray-500);font-size:0.85rem;">👤 ${order.customerName || 'عميل'}</span>
            </div>
            <span class="order-status ${statusInfo.class}">${statusInfo.icon} ${statusInfo.text}</span>
        </div>
        <div class="order-problem">
            <strong>🛠️ وصف المشكلة:</strong> ${order.problem || 'لم يتم تحديد المشكلة'}
        </div>
        <div class="order-details">
            <div class="order-detail-item"><span class="label">📅 تاريخ الطلب</span><span class="value">${date}</span></div>
            <div class="order-detail-item"><span class="label">📍 المنطقة</span><span class="value">${order.location || 'غير محدد'}</span></div>
            <div class="order-detail-item"><span class="label">📊 العروض</span><span class="value">${order.bids ? order.bids.length : 0} عرض</span></div>
        </div>
        <div class="order-actions">
            <button class="btn btn-outline btn-sm" id="detail-${order.id}">🔍 تفاصيل</button>
            ${actions}
        </div>
    </div>`;
}

function getStatusInfo(order) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const hasBid = order.bids && order.bids.some(b => b.techId === currentUser.id);

    if (order.status === 'completed') return { text: 'مكتمل', icon: '✔️', class: 'status-completed' };
    if (order.status === 'accepted') {
        if (order.selectedTechId === currentUser.id) return { text: 'تم اختياري 🎯', icon: '🎯', class: 'status-accepted' };
        return { text: 'تم الاختيار', icon: '✅', class: 'status-accepted' };
    }
    if (hasBid) return { text: 'تم تقديم عرض', icon: '💰', class: 'status-accepted' };
    return { text: 'في انتظار عروض', icon: '⏳', class: 'status-pending' };
}

// ========== نافذة التفاصيل ==========
function openDetailModal(order) {
    currentOrderId = order.id;
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    let bidsHTML = '';
    if (order.bids && order.bids.length > 0) {
        bidsHTML = '<div style="margin-top:15px;"><strong>📊 العروض المقدمة:</strong>';
        order.bids.forEach(b => {
            bidsHTML += `<div class="detail-item"><span>👨‍🔧 ${b.techName} ${b.techId === currentUser.id ? '(أنت)' : ''}</span><span>💰 ${b.price} ج.م</span></div>`;
        });
        bidsHTML += '</div>';
    }

    document.getElementById('detailTitle').textContent = `📋 تفاصيل الطلب #${order.id}`;
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-item"><span class="label">العميل</span><span class="value">👤 ${order.customerName}</span></div>
        <div class="detail-item"><span class="label">الجهاز</span><span class="value">${getDeviceIcon(order.deviceType)} ${order.deviceName}</span></div>
        <div class="detail-item"><span class="label">المشكلة</span><span class="value">${order.problem}</span></div>
        <div class="detail-item"><span class="label">تاريخ الطلب</span><span class="value">${date}</span></div>
        ${bidsHTML}
    `;
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ========== تقديم عرض سعر ==========
function openBidModal(orderId) {
    currentOrderId = orderId;
    document.getElementById('servicePrice').value = '';
    document.getElementById('priceModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePriceModal() {
    document.getElementById('priceModal').classList.remove('active');
    document.body.style.overflow = '';
}

function submitBid() {
    const price = parseInt(document.getElementById('servicePrice').value);
    if (!price || price < 50) { alert('الرجاء إدخال سعر صحيح'); return; }

    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));

    // جلب الطلب الحالي لتحديث العروض
    db.ref('orders/' + currentOrderId).once('value').then(snapshot => {
        const order = snapshot.val();
        const bids = order.bids || [];
        bids.push({
            techId: currentUser.id,
            techName: currentUser.fullName,
            price: price,
            createdAt: new Date().toISOString()
        });

        return db.ref('orders/' + currentOrderId).update({ bids: bids });
    }).then(() => {
        // إرسال إشعار للعميل
        db.ref('orders/' + currentOrderId).once('value').then(snapshot => {
            const order = snapshot.val();
            if (order && order.userId) {
                addNotificationToUser(order.userId, '💰 عرض سعر جديد', `الفني ${currentUser.fullName} قدم عرض سعر ${price} ج.م`, 'order', 'orders.html');
            }
        });

        closePriceModal();
        loadOrders();
        showNotification('تم تقديم عرض السعر 💰', 'success');
    });
}

// ========== إكمال الطلب ==========
function completeOrder(orderId) {
    if (!confirm('هل أنت متأكد من إكمال هذا الطلب؟')) return;

    db.ref('orders/' + orderId).update({
        status: 'completed',
        completedAt: new Date().toISOString()
    }).then(() => {
        // إرسال إشعار للعميل
        db.ref('orders/' + orderId).once('value').then(snapshot => {
            const order = snapshot.val();
            if (order && order.userId) {
                addNotificationToUser(order.userId, '✔️ تم إكمال طلبك', `تم إكمال صيانة ${order.deviceName}. يمكنك تقييم الخدمة.`, 'order', 'orders.html');
            }
        });

        loadOrders();
        showNotification('تم إكمال الطلب ✔️', 'success');
    });
}

// ========== تحديث الإحصائيات ==========
function updateStats(orders) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));

    document.getElementById('totalIncoming').textContent = orders.length;
    document.getElementById('pendingIncoming').textContent = orders.filter(o => o.status === 'pending' && (!o.bids || !o.bids.some(b => b.techId === currentUser.id))).length;
    
    // عداد "قدمت عرض"
    const bidCount = orders.filter(o => o.bids && o.bids.some(b => b.techId === currentUser.id)).length;
    const bidElement = document.getElementById('bidIncoming');
    if (bidElement) bidElement.textContent = bidCount;
    
    document.getElementById('acceptedIncoming').textContent = orders.filter(o => o.selectedTechId === currentUser.id && o.status === 'accepted').length;
    document.getElementById('newOrdersCount').textContent = orders.filter(o => o.status === 'pending' && (!o.bids || !o.bids.some(b => b.techId === currentUser.id))).length;
}

// ========== دوال مساعدة ==========
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
