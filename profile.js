/* ============================================
   شخصلي AI - تفاعلات صفحة الملف الشخصي
   ============================================ */
   const SECRET_KEY = 'ShakheslyAI2024SecretKey!@';

function encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
}

function decryptPassword(encryptedPassword) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
} 


document.addEventListener('DOMContentLoaded', function() {
    
    // التحقق من تسجيل الدخول
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // ========== بناء الشريط الجانبي ==========
    buildSidebar(currentUser);

    // ========== تحميل بيانات المستخدم ==========
    loadUserData(currentUser);

    // ========== تبويبات ==========
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('data-tab');
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });

    // ========== حفظ المعلومات الشخصية ==========
    document.getElementById('infoForm').addEventListener('submit', savePersonalInfo);

    // ========== تغيير كلمة المرور ==========
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
    document.getElementById('newPassword').addEventListener('input', checkPasswordStrength);

    // ========== حفظ الإعدادات ==========
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);

    // ========== حذف الحساب ==========
    document.getElementById('btnDeleteAccount').addEventListener('click', openDeleteModal);
    document.getElementById('modalCloseDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('btnCancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('btnConfirmDelete').addEventListener('click', deleteAccount);
    document.getElementById('deleteAccountModal').addEventListener('click', function(e) {
        if (e.target === this) closeDeleteModal();
    });
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
                <a href="#"><i class="fas fa-check-circle"></i> المكتملة</a>
                <a href="#"><i class="fas fa-star"></i> تقييماتي</a>
                <a href="profile.html" class="active"><i class="fas fa-user-cog"></i> الملف الشخصي</a>
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
                <a href="profile.html" class="active"><i class="fas fa-user"></i> الملف الشخصي</a>
            </nav>
            <button class="sidebar-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
        `;
    }
}

/* ==============================
   تحميل بيانات المستخدم
   ============================== */
function loadUserData(user) {
    // عرض الاسم والبريد
    document.getElementById('displayName').textContent = user.fullName || 'المستخدم';
    document.getElementById('displayEmail').textContent = user.email || '';
    document.getElementById('avatarInitial').textContent = (user.fullName || 'U')[0].toUpperCase();
    document.getElementById('userAvatar').style.background = user.type === 'tech' ? 
        'linear-gradient(135deg, #10B981, #059669)' : 
        'linear-gradient(135deg, #2563EB, #1E3A8A)';

    // تعبئة النموذج
    document.getElementById('fullName').value = user.fullName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';

    // حقول الفني
    if (user.type === 'tech') {
        document.getElementById('techFields').style.display = 'block';
        document.getElementById('specialization').value = user.specialization || '';
        document.getElementById('experience').value = user.experience || '';
        document.getElementById('location').value = user.location || '';
        document.getElementById('about').value = user.about || '';
    }

    // تحميل الإعدادات
    const settings = JSON.parse(localStorage.getItem('shakhesly_settings')) || {};
    document.getElementById('notificationsEnabled').checked = settings.notifications !== false;
    document.getElementById('emailNotifications').checked = settings.emailNotifications === true;
    document.getElementById('maintenanceReminders').checked = settings.maintenanceReminders !== false;
}

/* ==============================
   حفظ المعلومات الشخصية
   ============================== */
function savePersonalInfo(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!fullName || !email || !phone) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة', 'error');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showNotification('الرجاء إدخال بريد إلكتروني صحيح', 'error');
        return;
    }

    // تحديث بيانات الجلسة
    let currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    currentUser.fullName = fullName;
    currentUser.email = email;
    currentUser.phone = phone;

    if (currentUser.type === 'tech') {
        currentUser.specialization = document.getElementById('specialization').value;
        currentUser.experience = document.getElementById('experience').value;
        currentUser.location = document.getElementById('location').value;
        currentUser.about = document.getElementById('about').value.trim();
    }

    localStorage.setItem('shakhesly_current_user', JSON.stringify(currentUser));

    // تحديث في قائمة المستخدمين
    let users = JSON.parse(localStorage.getItem('shakhesly_users')) || [];
    users = users.map(u => {
        if (u.id === currentUser.id || u.email === currentUser.email) {
            return { ...u, ...currentUser, password: u.password };
        }
        return u;
    });
    localStorage.setItem('shakhesly_users', JSON.stringify(users));

    // تحديث العرض
    document.getElementById('displayName').textContent = fullName;
    document.getElementById('displayEmail').textContent = email;
    document.getElementById('avatarInitial').textContent = fullName[0].toUpperCase();

    showNotification('تم حفظ التغييرات بنجاح ✅', 'success');
}

/* ==============================
   تغيير كلمة المرور
   ============================== */
function changePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword.length < 6) {
        showNotification('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('كلمة المرور الجديدة غير متطابقة', 'error');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    let users = JSON.parse(localStorage.getItem('shakhesly_users')) || [];
    
    const userInDB = users.find(u => u.email === currentUser.email);
    
    if (userInDB && userInDB.password !== currentPassword) {
        showNotification('كلمة المرور الحالية غير صحيحة', 'error');
        return;
    }

    // تحديث كلمة المرور
    users = users.map(u => {
        if (u.email === currentUser.email) {
            u.password = newPassword;
        }
        return u;
    });
    localStorage.setItem('shakhesly_users', JSON.stringify(users));

    document.getElementById('passwordForm').reset();
    document.getElementById('strengthBar').style.width = '0';
    document.getElementById('strengthText').textContent = 'قوة كلمة المرور';

    showNotification('تم تغيير كلمة المرور بنجاح 🔒', 'success');
}

/* ==============================
   قوة كلمة المرور
   ============================== */
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
    const texts = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];
    
    bar.style.width = (strength * 20) + '%';
    bar.style.background = colors[strength];
    text.textContent = texts[strength];
}

/* ==============================
   حفظ الإعدادات
   ============================== */
function saveSettings() {
    const settings = {
        notifications: document.getElementById('notificationsEnabled').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        maintenanceReminders: document.getElementById('maintenanceReminders').checked
    };
    
    localStorage.setItem('shakhesly_settings', JSON.stringify(settings));
    showNotification('تم حفظ الإعدادات ⚙️', 'success');
}

/* ==============================
   حذف الحساب
   ============================== */
function openDeleteModal() {
    document.getElementById('deleteAccountModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    document.getElementById('deleteAccountModal').classList.remove('active');
    document.body.style.overflow = '';
}

function deleteAccount() {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));

    // حذف من قائمة المستخدمين
    let users = JSON.parse(localStorage.getItem('shakhesly_users')) || [];
    users = users.filter(u => u.email !== currentUser.email);
    localStorage.setItem('shakhesly_users', JSON.stringify(users));

    // حذف الأجهزة
    let devices = JSON.parse(localStorage.getItem('shakhesly_devices')) || [];
    devices = devices.filter(d => d.userId !== currentUser.id);
    localStorage.setItem('shakhesly_devices', JSON.stringify(devices));

    // حذف الطلبات
    let orders = JSON.parse(localStorage.getItem('shakhesly_orders')) || [];
    orders = orders.filter(o => o.userId !== currentUser.id && o.techId !== currentUser.id);
    localStorage.setItem('shakhesly_orders', JSON.stringify(orders));

    // حذف الجلسة
    localStorage.removeItem('shakhesly_current_user');
    localStorage.removeItem('shakhesly_settings');

    window.location.href = 'index.html';
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
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#2563EB';
    const n = document.createElement('div');
    n.textContent = message;
    Object.assign(n.style, {
        position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
        background: bg, color: 'white', padding: '14px 24px', borderRadius: '50px',
        zIndex: '9999', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = '0.3s'; setTimeout(() => n.remove(), 300); }, 3000);
} 
