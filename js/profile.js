// ========== الملف الشخصي - Firebase ==========
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    if (typeof AOS !== 'undefined') AOS.init({ duration: 600, once: true });

    buildSidebar(currentUser);

    // تحميل بيانات المستخدم من Firebase
    if (currentUser.id) {
        db.ref('users/' + currentUser.id).once('value').then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                const fullUser = { ...currentUser, ...userData, id: currentUser.id };
                loadUserData(fullUser);
            } else {
                loadUserData(currentUser);
            }
        });
    } else {
        loadUserData(currentUser);
    }

    // تبويبات
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('data-tab');
            const targetEl = document.getElementById('tab-' + target);
            if (targetEl) targetEl.classList.add('active');
        });
    });

    // حفظ المعلومات الشخصية
    document.getElementById('infoForm')?.addEventListener('submit', savePersonalInfo);
    // تغيير كلمة المرور
    document.getElementById('passwordForm')?.addEventListener('submit', changePassword);
    document.getElementById('newPassword')?.addEventListener('input', checkPasswordStrength);
    // حفظ الإعدادات
    document.getElementById('btnSaveSettings')?.addEventListener('click', saveSettings);
    // حذف الحساب
    document.getElementById('btnDeleteAccount')?.addEventListener('click', openDeleteModal);
    document.getElementById('modalCloseDelete')?.addEventListener('click', closeDeleteModal);
    document.getElementById('btnCancelDelete')?.addEventListener('click', closeDeleteModal);
    document.getElementById('btnConfirmDelete')?.addEventListener('click', deleteAccount);
    document.getElementById('deleteAccountModal')?.addEventListener('click', function (e) {
        if (e.target === this) closeDeleteModal();
    });
});

// ========== بناء الشريط الجانبي ==========
function buildSidebar(user) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (user.type === 'tech') {
        sidebar.innerHTML = `
            <div class="sidebar-logo"><img src="assets/images/logo.png" alt="شخصلي" style="height:32px;width:auto;"></div>
            <nav class="sidebar-menu">
                <a href="dashboard-tech.html"><i class="fas fa-home"></i> الرئيسية</a>
                <a href="incoming-orders.html"><i class="fas fa-tasks"></i> الطلبات الواردة</a>
                <a href="ratings.html"><i class="fas fa-star"></i> تقييماتي</a>
                <a href="notifications.html"><i class="fas fa-bell"></i> الإشعارات</a>
                <a href="profile.html" class="active"><i class="fas fa-user-cog"></i> الملف الشخصي</a>
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
                <a href="notifications.html"><i class="fas fa-bell"></i> الإشعارات</a>
                <a href="profile.html" class="active"><i class="fas fa-user"></i> الملف الشخصي</a>
            </nav>
            <button class="sidebar-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
        `;
    }
}

// ========== تحميل بيانات المستخدم ==========
function loadUserData(user) {
    document.getElementById('displayName').textContent = user.fullName || 'المستخدم';
    document.getElementById('displayEmail').textContent = user.email || '';
    document.getElementById('avatarInitial').textContent = (user.fullName || 'U')[0].toUpperCase();
    document.getElementById('userAvatar').style.background = user.type === 'tech' ?
        'linear-gradient(135deg, #10B981, #059669)' :
        'linear-gradient(135deg, #2563EB, #1E3A8A)';

    document.getElementById('fullName').value = user.fullName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';

    if (user.type === 'tech') {
        document.getElementById('techFields').style.display = 'block';
        document.getElementById('specialization').value = user.specialization || '';
        document.getElementById('experience').value = user.experience || '';
        document.getElementById('location').value = user.location || '';
        document.getElementById('about').value = user.about || '';
    }

    const settings = JSON.parse(localStorage.getItem('shakhesly_settings')) || {};
    document.getElementById('notificationsEnabled').checked = settings.notifications !== false;
    document.getElementById('emailNotifications').checked = settings.emailNotifications === true;
    document.getElementById('maintenanceReminders').checked = settings.maintenanceReminders !== false;
}

// ========== حفظ المعلومات الشخصية ==========
function savePersonalInfo(e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));

    if (!fullName || !email || !phone) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showNotification('الرجاء إدخال بريد إلكتروني صحيح', 'error');
        return;
    }

    const updatedData = {
        fullName, email, phone,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    if (currentUser.type === 'tech') {
        updatedData.specialization = document.getElementById('specialization')?.value || '';
        updatedData.experience = document.getElementById('experience')?.value || '';
        updatedData.location = document.getElementById('location')?.value || '';
        updatedData.about = document.getElementById('about')?.value.trim() || '';
    }

    db.ref('users/' + currentUser.id).update(updatedData)
        .then(() => {
            localStorage.setItem('shakhesly_current_user', JSON.stringify({
                ...currentUser, fullName, email, phone,
                specialization: updatedData.specialization || currentUser.specialization || '',
                experience: updatedData.experience || currentUser.experience || '',
                location: updatedData.location || currentUser.location || '',
                about: updatedData.about || currentUser.about || ''
            }));
            document.getElementById('displayName').textContent = fullName;
            document.getElementById('displayEmail').textContent = email;
            document.getElementById('avatarInitial').textContent = fullName[0].toUpperCase();
            showNotification('تم حفظ التغييرات بنجاح ✅', 'success');
        })
        .catch(err => {
            console.error('خطأ في الحفظ:', err);
            showNotification('❌ حدث خطأ أثناء الحفظ', 'error');
        });
}

// ========== تغيير كلمة المرور ==========
function changePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));

    if (newPassword.length < 6) {
        showNotification('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    if (newPassword !== confirmPassword) {
        showNotification('كلمة المرور الجديدة غير متطابقة', 'error');
        return;
    }

    db.ref('users/' + currentUser.id).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            if (!userData) { showNotification('❌ حدث خطأ', 'error'); return; }
            let isPasswordCorrect = false;
            try {
                if (typeof CryptoJS !== 'undefined') {
                    const decrypted = CryptoJS.AES.decrypt(userData.password, 'ShakheslyAI2024SecretKey!@#').toString(CryptoJS.enc.Utf8);
                    isPasswordCorrect = (decrypted === currentPassword);
                } else {
                    isPasswordCorrect = (userData.password === currentPassword);
                }
            } catch (e) { isPasswordCorrect = (userData.password === currentPassword); }
            if (!isPasswordCorrect) { showNotification('كلمة المرور الحالية غير صحيحة', 'error'); return; }
            let encryptedPassword = newPassword;
            if (typeof CryptoJS !== 'undefined') {
                encryptedPassword = CryptoJS.AES.encrypt(newPassword, 'ShakheslyAI2024SecretKey!@#').toString();
            }
            return db.ref('users/' + currentUser.id).update({ password: encryptedPassword });
        })
        .then(() => {
            document.getElementById('passwordForm').reset();
            document.getElementById('strengthBar').style.width = '0';
            document.getElementById('strengthText').textContent = 'قوة كلمة المرور';
            showNotification('تم تغيير كلمة المرور بنجاح 🔒', 'success');
        })
        .catch(err => { console.error(err); showNotification('❌ حدث خطأ', 'error'); });
}

// ========== قوة كلمة المرور ==========
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
    bar.style.background = colors[strength] || colors[4];
    text.textContent = texts[strength] || texts[4];
}

// ========== حفظ الإعدادات ==========
function saveSettings() {
    const settings = {
        notifications: document.getElementById('notificationsEnabled').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        maintenanceReminders: document.getElementById('maintenanceReminders').checked
    };
    localStorage.setItem('shakhesly_settings', JSON.stringify(settings));
    showNotification('تم حفظ الإعدادات ⚙️', 'success');
}

// ========== حذف الحساب ==========
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
    if (!currentUser.id) { showNotification('❌ حدث خطأ', 'error'); return; }
    db.ref('users/' + currentUser.id).remove()
        .then(() => {
            localStorage.removeItem('shakhesly_current_user');
            localStorage.removeItem('shakhesly_settings');
            window.location.href = 'index.html';
        })
        .catch(err => { console.error(err); showNotification('❌ حدث خطأ', 'error'); });
}

// ========== تسجيل الخروج ==========
function logout() {
    localStorage.removeItem('shakhesly_current_user');
    window.location.href = 'index.html';
}

// ========== إشعارات ==========
function showNotification(message, type) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#2563EB';
    const n = document.createElement('div');
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
