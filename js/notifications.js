// ========== الإشعارات - Firebase ==========
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    buildSidebar(currentUser);

    let currentFilter = 'all';
    loadNotifications(currentUser);

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            loadNotifications(currentUser);
        });
    });

    document.getElementById('btnMarkAllRead')?.addEventListener('click', () => markAllRead(currentUser));
    document.getElementById('btnClearAll')?.addEventListener('click', () => clearAll(currentUser));
});

// ========== بناء الشريط الجانبي ==========
function buildSidebar(user) {
    const sidebar = document.getElementById('sidebar');
    if (user.type === 'tech') {
        sidebar.innerHTML = `
            <div class="sidebar-logo"><img src="assets/images/logo.png" alt="شخصلي" style="height:32px;width:auto;"></div>
            <nav class="sidebar-menu">
                <a href="dashboard-tech.html"><i class="fas fa-home"></i> الرئيسية</a>
                <a href="incoming-orders.html"><i class="fas fa-tasks"></i> الطلبات الواردة</a>
                <a href="ratings.html"><i class="fas fa-star"></i> تقييماتي</a>
                <a href="notifications.html" class="active"><i class="fas fa-bell"></i> الإشعارات</a>
                <a href="profile.html"><i class="fas fa-cog"></i> الإعدادات</a>
            </nav>
            <button class="sidebar-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
        `;
    } else {
        sidebar.innerHTML = `
            <div class="sidebar-logo"><img src="assets/images/logo.png" alt="شخصلي" style="height:32px;width:auto;"></div>
            <nav class="sidebar-menu">
                <a href="dashboard-user.html"><i class="fas fa-home"></i> الرئيسية</a>
                <a href="diagnose.html"><i class="fas fa-stethoscope"></i> تشخيص عطل</a>
                <a href="devices.html"><i class="fas fa-mobile-alt"></i> أجهزتي</a>
                <a href="orders.html"><i class="fas fa-history"></i> طلباتي</a>
                <a href="notifications.html" class="active"><i class="fas fa-bell"></i> الإشعارات</a>
                <a href="profile.html"><i class="fas fa-user"></i> الملف الشخصي</a>
            </nav>
            <button class="sidebar-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
        `;
    }
}

// ========== تحميل الإشعارات ==========
function loadNotifications(user) {
    const currentFilter = document.querySelector('.tab.active')?.getAttribute('data-filter') || 'all';

    db.ref('notifications')
        .orderByChild('userId')
        .equalTo(user.id)
        .once('value')
        .then(snapshot => {
            const notifications = [];
            snapshot.forEach(child => {
                notifications.push({ id: child.key, ...child.val() });
            });

            // فلترة حسب التبويب
            let filtered = notifications;
            if (currentFilter === 'unread') {
                filtered = notifications.filter(n => !n.read);
            } else if (currentFilter !== 'all') {
                filtered = notifications.filter(n => n.type === currentFilter);
            }

            // ترتيب: الأحدث أولاً
            filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            // تحديث عداد غير المقروء
            const unreadCount = notifications.filter(n => !n.read).length;
            const unreadBadge = document.getElementById('unreadCount');
            if (unreadBadge) {
                unreadBadge.textContent = unreadCount;
                unreadBadge.style.display = unreadCount > 0 ? 'inline' : 'none';
            }

            renderNotifications(filtered, user);
        });
}

function renderNotifications(notifications, user) {
    const list = document.getElementById('notificationsList');
    const empty = document.getElementById('emptyState');

    if (notifications.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = notifications.map(n => createNotificationCard(n)).join('');

        notifications.forEach(n => {
            document.getElementById(`read-${n.id}`)?.addEventListener('click', (e) => {
                e.stopPropagation();
                markAsRead(n.id, user);
            });
            document.getElementById(`delete-${n.id}`)?.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNotification(n.id, user);
            });
        });

        // الضغط على الإشعار يحدده كمقروء ويفتح الرابط
        document.querySelectorAll('.notification-card').forEach(card => {
            card.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                const notification = notifications.find(n => n.id === id);
                markAsRead(id, user);
                if (notification && notification.link) {
                    window.location.href = notification.link;
                }
            });
        });
    }
}

function createNotificationCard(notification) {
    const timeAgo = getTimeAgo(notification.createdAt ? new Date(notification.createdAt) : new Date());
    const iconInfo = getIconInfo(notification.type);

    return `
        <div class="notification-card ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
            <div class="notification-icon ${iconInfo.class}">${iconInfo.icon}</div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-text">${notification.message}</div>
                <div class="notification-time">🕐 ${timeAgo}</div>
                <div class="notification-actions">
                    ${!notification.read ? `<button class="btn btn-primary btn-xs" id="read-${notification.id}">✔️ مقروء</button>` : ''}
                    <button class="btn btn-outline btn-xs" id="delete-${notification.id}">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

// ========== تحديد كمقروء ==========
function markAsRead(id, user) {
    db.ref('notifications/' + id).update({ read: true }).then(() => {
        loadNotifications(user);
    });
}

// ========== تحديد الكل كمقروء ==========
function markAllRead(user) {
    const updates = {};
    // جلب كل الإشعارات غير المقروءة وتحديثها
    db.ref('notifications')
        .orderByChild('userId')
        .equalTo(user.id)
        .once('value')
        .then(snapshot => {
            snapshot.forEach(child => {
                const notif = child.val();
                if (!notif.read) {
                    updates[child.key + '/read'] = true;
                }
            });
            if (Object.keys(updates).length > 0) {
                return db.ref('notifications').update(updates);
            }
        })
        .then(() => {
            loadNotifications(user);
            showNotification('تم تحديد الكل كمقروء ✅', 'success');
        });
}

// ========== حذف إشعار ==========
function deleteNotification(id, user) {
    db.ref('notifications/' + id).remove().then(() => {
        loadNotifications(user);
        showNotification('تم حذف الإشعار 🗑️', 'warning');
    });
}

// ========== حذف الكل ==========
function clearAll(user) {
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) return;

    const updates = {};
    db.ref('notifications')
        .orderByChild('userId')
        .equalTo(user.id)
        .once('value')
        .then(snapshot => {
            snapshot.forEach(child => {
                updates[child.key] = null;
            });
            if (Object.keys(updates).length > 0) {
                return db.ref('notifications').update(updates);
            }
        })
        .then(() => {
            loadNotifications(user);
            showNotification('تم حذف جميع الإشعارات 🗑️', 'warning');
        });
}

// ========== الوقت النسبي ==========
function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return date.toLocaleDateString('ar-EG');
}

// ========== أيقونة الإشعار ==========
function getIconInfo(type) {
    const map = {
        'order': { icon: '📋', class: 'icon-order' },
        'maintenance': { icon: '🔧', class: 'icon-maintenance' },
        'system': { icon: '⚙️', class: 'icon-system' },
        'success': { icon: '✅', class: 'icon-success' },
        'warning': { icon: '⚠️', class: 'icon-warning' }
    };
    return map[type] || { icon: '🔔', class: 'icon-system' };
}

// ========== تسجيل الخروج ==========
function logout() {
    localStorage.removeItem('shakhesly_current_user');
    window.location.href = 'index.html';
}

// ========== إشعارات ==========
function showNotification(message, type) {
    document.querySelectorAll('.toast').forEach(n => n.remove());
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#2563EB';
    const n = document.createElement('div');
    n.className = 'toast';
    n.textContent = message;
    Object.assign(n.style, {
        position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
        background: bg, color: 'white', padding: '14px 24px', borderRadius: '50px',
        zIndex: '9999', fontWeight: '700', fontSize: '0.95rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = '0.3s'; setTimeout(() => n.remove(), 300); }, 3000);
}
