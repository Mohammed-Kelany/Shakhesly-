/* ============================================
   شخصلي AI - تفاعلات صفحة الإشعارات
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // التحقق من تسجيل الدخول
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    let currentFilter = 'all';

    // بناء الشريط الجانبي
    buildSidebar(currentUser);

    // تحميل الإشعارات
    loadNotifications();

    // تبويبات
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            loadNotifications();
        });
    });

    // أزرار
    document.getElementById('btnMarkAllRead').addEventListener('click', markAllRead);
    document.getElementById('btnClearAll').addEventListener('click', clearAll);
});

/* ==============================
   بناء الشريط الجانبي
   ============================== */
function buildSidebar(user) {
    const sidebar = document.getElementById('sidebar');
    
    if (user.type === 'tech') {
        sidebar.innerHTML = `
            <div class="sidebar-logo">🔧 شخصلي</div>
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
            <div class="sidebar-logo">🤖 شخصلي</div>
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

/* ==============================
   جلب الإشعارات
   ============================== */
function getNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const allNotifications = JSON.parse(localStorage.getItem('shakhesly_notifications')) || [];
    return allNotifications.filter(n => n.userId === currentUser.id);
}

/* ==============================
   حفظ الإشعارات
   ============================== */
function saveNotifications(notifications) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const allNotifications = JSON.parse(localStorage.getItem('shakhesly_notifications')) || [];
    const others = allNotifications.filter(n => n.userId !== currentUser.id);
    localStorage.setItem('shakhesly_notifications', JSON.stringify([...others, ...notifications]));
}

/* ==============================
   تحميل وعرض الإشعارات
   ============================== */
function loadNotifications() {
    let notifications = getNotifications();
    
    // فلترة
    if (currentFilter === 'unread') {
        notifications = notifications.filter(n => !n.read);
    } else if (currentFilter !== 'all') {
        notifications = notifications.filter(n => n.type === currentFilter);
    }
    
    // ترتيب: الأحدث أولاً
    notifications.sort((a, b) => b.id - a.id);
    
    const list = document.getElementById('notificationsList');
    const empty = document.getElementById('emptyState');
    
    // تحديث عداد غير المقروء
    const unreadCount = getNotifications().filter(n => !n.read).length;
    document.getElementById('unreadCount').textContent = unreadCount;
    document.getElementById('unreadCount').style.display = unreadCount > 0 ? 'inline' : 'none';
    
    if (notifications.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        list.innerHTML = notifications.map(n => createNotificationCard(n)).join('');
        
        // ربط الأزرار
        notifications.forEach(n => {
            document.getElementById(`read-${n.id}`)?.addEventListener('click', (e) => {
                e.stopPropagation();
                markAsRead(n.id);
            });
            document.getElementById(`delete-${n.id}`)?.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNotification(n.id);
            });
        });
        
        // الضغط على الإشعار
        document.querySelectorAll('.notification-card').forEach(card => {
            card.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                markAsRead(id);
                // لو فيه رابط، افتحه
                const notification = notifications.find(n => n.id === id);
                if (notification && notification.link) {
                    window.location.href = notification.link;
                }
            });
        });
    }
}

/* ==============================
   إنشاء كرت الإشعار
   ============================== */
function createNotificationCard(notification) {
    const timeAgo = getTimeAgo(new Date(notification.createdAt));
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

/* ==============================
   تحديد كمقروء
   ============================== */
function markAsRead(id) {
    let notifications = getNotifications();
    notifications = notifications.map(n => {
        if (n.id === id) n.read = true;
        return n;
    });
    saveNotifications(notifications);
    loadNotifications();
}

/* ==============================
   تحديد الكل كمقروء
   ============================== */
function markAllRead() {
    let notifications = getNotifications();
    notifications = notifications.map(n => {
        n.read = true;
        return n;
    });
    saveNotifications(notifications);
    loadNotifications();
    showNotification('تم تحديد الكل كمقروء ✅', 'success');
}

/* ==============================
   حذف إشعار
   ============================== */
function deleteNotification(id) {
    let notifications = getNotifications();
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications(notifications);
    loadNotifications();
    showNotification('تم حذف الإشعار 🗑️', 'warning');
}

/* ==============================
   حذف الكل
   ============================== */
function clearAll() {
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) return;
    saveNotifications([]);
    loadNotifications();
    showNotification('تم حذف جميع الإشعارات 🗑️', 'warning');
}

/* ==============================
   الوقت النسبي
   ============================== */
function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // بالثواني
    
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return date.toLocaleDateString('ar-EG');
}

/* ==============================
   أيقونة الإشعار
   ============================== */
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

/* ==============================
   إضافة إشعار جديد (للاستخدام من أي صفحة)
   ============================== */
// تقدر تستدعي الدالة دي من أي مكان في المشروع
function addNotification(userId, title, message, type, link) {
    const allNotifications = JSON.parse(localStorage.getItem('shakhesly_notifications')) || [];
    
    allNotifications.push({
        id: Date.now(),
        userId: userId,
        title: title,
        message: message,
        type: type || 'system',
        link: link || null,
        read: false,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('shakhesly_notifications', JSON.stringify(allNotifications));
}

/* ==============================
   تسجيل الخروج
   ============================== */
function logout() {
    localStorage.removeItem('shakhesly_current_user');
    window.location.href = 'index.html';
}

/* ==============================
   إشعارات
   ============================== */
function showNotification(message, type) {
    document.querySelectorAll('.toast').forEach(n => n.remove());
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#2563EB';
    const n = document.createElement('div');
    n.className = 'toast';
    n.textContent = message;
    Object.assign(n.style, {
        position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
        background: bg, color: 'white', padding: '14px 24px', borderRadius: '50px',
        zIndex: '9999', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = '0.3s'; setTimeout(() => n.remove(), 300); }, 3000);
/* ==============================
   تحديث عداد الإشعارات في كل الصفحات
   ============================== */
function updateNotificationBadge() {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) return;
    
    const allNotifications = JSON.parse(localStorage.getItem('shakhesly_notifications')) || [];
    const userNotifications = allNotifications.filter(n => n.userId === currentUser.id && !n.read);
    const count = userNotifications.length;
    
    // تحديث كل عناصر العداد في الصفحة
    const badges = document.querySelectorAll('.notification-badge, .badge-count, #unreadCount');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    });
    
    // تحديث عنوان الصفحة
    if (count > 0) {
        document.title = `(${count}) شخصلي AI - مساعدك الذكي`;
    }
}

// تشغيل التحديث
updateNotificationBadge(); 

} 
