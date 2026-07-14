// ========== أجهزتي - Firebase ==========
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    // ربط واجهة المستخدم
    document.getElementById('btnAddDevice')?.addEventListener('click', openAddModal);
    document.getElementById('btnAddFirstDevice')?.addEventListener('click', openAddModal);
    document.getElementById('modalClose')?.addEventListener('click', closeDeviceModal);
    document.getElementById('btnCancel')?.addEventListener('click', closeDeviceModal);
    document.getElementById('btnCancelDelete')?.addEventListener('click', closeDeleteModal);
    document.getElementById('btnConfirmDelete')?.addEventListener('click', deleteDevice);
    document.getElementById('deviceForm')?.addEventListener('submit', saveDevice);
    document.getElementById('searchDevice')?.addEventListener('input', loadDevices);
    document.getElementById('filterType')?.addEventListener('change', loadDevices);
    document.getElementById('filterStatus')?.addEventListener('change', loadDevices);

    loadDevices();
});

// ========== دوال Firebase العامة ==========
function getUserDevicesRef() {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    return db.ref('devices').orderByChild('userId').equalTo(currentUser.id);
}

function loadDevices() {
    getUserDevicesRef().once('value').then(snapshot => {
        const devices = [];
        snapshot.forEach(child => {
            devices.push({ id: child.key, ...child.val() });
        });
        renderDevices(devices);
        updateStats(devices);
    });
}

function renderDevices(devices) {
    const grid = document.getElementById('devicesGrid');
    const empty = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchDevice')?.value?.toLowerCase() || '';
    const filterType = document.getElementById('filterType')?.value || 'all';
    const filterStatus = document.getElementById('filterStatus')?.value || 'all';

    let filtered = devices.filter(d => {
        if (searchTerm && !(d.brand?.toLowerCase().includes(searchTerm) || d.model?.toLowerCase().includes(searchTerm))) return false;
        if (filterType !== 'all' && d.type !== filterType) return false;
        if (filterStatus === 'active' && d.status !== 'active') return false;
        if (filterStatus === 'maintenance' && d.status !== 'maintenance') return false;
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        grid.innerHTML = filtered.map(device => createDeviceCard(device)).join('');
        // ربط أحداث الأزرار
        filtered.forEach(d => {
            document.getElementById(`diagnose-${d.id}`)?.addEventListener('click', () => window.location.href = `diagnose.html?device=${d.id}`);
            document.getElementById(`edit-${d.id}`)?.addEventListener('click', () => openEditModal(d));
            document.getElementById(`delete-${d.id}`)?.addEventListener('click', () => openDeleteModal(d.id));
            document.getElementById(`mark-maintenance-${d.id}`)?.addEventListener('click', () => toggleMaintenance(d));
        });
    }
}

function createDeviceCard(device) {
    const icon = getDeviceIcon(device.type);
    const typeName = getDeviceTypeName(device.type);
    const warranty = checkWarranty(device.purchaseDate, device.warrantyMonths);
    const next = getNextMaintenance(device.purchaseDate, device.maintenanceInterval);
    const statusClass = device.status === 'active' ? 'status-active' : 'status-maintenance';
    const statusText = device.status === 'active' ? '✅ سليم' : '🔧 يحتاج صيانة';

    return `
    <div class="device-card">
        <div class="device-card-header">
            <div class="device-icon">${icon}</div>
            <span class="device-status ${statusClass}">${statusText}</span>
        </div>
        <div class="device-name">${device.brand} - ${device.model}</div>
        <div class="device-details">
            <div class="device-detail"><span class="label">النوع</span><span class="value">${typeName}</span></div>
            <div class="device-detail"><span class="label">تاريخ الشراء</span><span class="value">${device.purchaseDate}</span></div>
            <div class="device-detail"><span class="label">الضمان</span><span class="value ${warranty.valid ? 'warranty-valid' : 'warranty-expired'}">${warranty.text}</span></div>
            ${next ? `<div class="device-detail"><span class="label">الصيانة القادمة</span><span class="value ${next.remaining <= 30 ? 'maintenance-soon' : ''}">بعد ${next.remaining} يوم</span></div>` : ''}
            ${device.notes ? `<div class="device-detail"><span class="label">ملاحظات</span><span class="value">${device.notes.substring(0,30)}</span></div>` : ''}
        </div>
        <div class="device-actions">
            <button class="btn btn-primary btn-sm" id="diagnose-${device.id}"><i class="fas fa-stethoscope"></i> تشخيص</button>
            <button class="btn btn-outline btn-sm" id="mark-maintenance-${device.id}"><i class="fas fa-tools"></i> ${device.status==='active'?'طلب صيانة':'تم الإصلاح'}</button>
            <button class="btn btn-outline btn-sm" id="edit-${device.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline btn-sm" style="color:#EF4444;border-color:#EF4444;" id="delete-${device.id}"><i class="fas fa-trash"></i></button>
        </div>
    </div>`;
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = '➕ إضافة جهاز جديد';
    document.getElementById('deviceId').value = '';
    document.getElementById('deviceForm').reset();
    document.getElementById('deviceModal').classList.add('active');
}

function openEditModal(device) {
    document.getElementById('modalTitle').textContent = '✏️ تعديل الجهاز';
    document.getElementById('deviceId').value = device.id;
    document.getElementById('deviceType').value = device.type;
    document.getElementById('deviceBrand').value = device.brand;
    document.getElementById('deviceModel').value = device.model;
    document.getElementById('purchaseDate').value = device.purchaseDate;
    document.getElementById('warrantyMonths').value = device.warrantyMonths || '';
    document.getElementById('deviceNotes').value = device.notes || '';
    document.getElementById('maintenanceInterval').value = device.maintenanceInterval || '6';
    document.getElementById('deviceModal').classList.add('active');
}

function closeDeviceModal() {
    document.getElementById('deviceModal').classList.remove('active');
}

function saveDevice(e) {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const id = document.getElementById('deviceId').value;
    const data = {
        userId: currentUser.id,
        type: document.getElementById('deviceType').value,
        brand: document.getElementById('deviceBrand').value.trim(),
        model: document.getElementById('deviceModel').value.trim(),
        purchaseDate: document.getElementById('purchaseDate').value,
        warrantyMonths: document.getElementById('warrantyMonths').value,
        notes: document.getElementById('deviceNotes').value.trim(),
        maintenanceInterval: document.getElementById('maintenanceInterval').value,
        status: 'active',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    if (!data.type || !data.brand || !data.model || !data.purchaseDate) {
        alert('الرجاء إدخال جميع البيانات المطلوبة');
        return;
    }

    if (id) {
        // تعديل
        db.ref(`devices/${id}`).update(data).then(() => {
            closeDeviceModal();
            loadDevices();
            showNotification('تم تعديل الجهاز بنجاح ✅', 'success');
        });
    } else {
        // إضافة
        db.ref('devices').push(data).then(() => {
            closeDeviceModal();
            loadDevices();
            showNotification('تم إضافة الجهاز بنجاح 🎉', 'success');
        });
    }
}

let deviceToDelete = null;
function openDeleteModal(deviceId) {
    deviceToDelete = deviceId;
    document.getElementById('deleteModal').classList.add('active');
}
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deviceToDelete = null;
}
function deleteDevice() {
    if (deviceToDelete) {
        db.ref(`devices/${deviceToDelete}`).remove().then(() => {
            closeDeleteModal();
            loadDevices();
            showNotification('تم حذف الجهاز 🗑️', 'success');
        });
    }
}

function toggleMaintenance(device) {
    const newStatus = device.status === 'active' ? 'maintenance' : 'active';
    db.ref(`devices/${device.id}`).update({ status: newStatus }).then(() => {
        loadDevices();
        showNotification('تم تحديث حالة الجهاز ✅', 'success');
    });
}

function updateStats(devices) {
    document.getElementById('totalDevices').textContent = devices.length;
    document.getElementById('activeDevices').textContent = devices.filter(d => d.status === 'active').length;
    document.getElementById('needMaintenance').textContent = devices.filter(d => d.status === 'maintenance').length;
    const now = new Date();
    const upcoming = devices.filter(d => {
        const next = getNextMaintenance(d.purchaseDate, d.maintenanceInterval);
        return next && next.remaining <= 30;
    }).length;
    document.getElementById('upcomingMaintenance').textContent = upcoming;
}

// ========== دوال مساعدة ==========
function getDeviceIcon(type) {
    const icons = { fridge:'❄️', freezer:'🧊', washer:'🌀', dryer:'👕', dishwasher:'🍽️', ac:'🌬️', 'water-heater':'💧', oven:'🔥', microwave:'📡', blender:'🥤', tv:'📺', laptop:'💻', desktop:'🖥️', printer:'🖨️', car:'🚗', motorcycle:'🏍️', scooter:'🛵', smartphone:'📱', smartwatch:'⌚', other:'📦' };
    return icons[type] || '📦';
}
function getDeviceTypeName(type) {
    const names = { fridge:'ثلاجة', freezer:'ديب فريزر', washer:'غسالة أتوماتيك', dryer:'مجفف', dishwasher:'غسالة أطباق', ac:'مكيف هواء', 'water-heater':'سخان مياه', oven:'فرن', microwave:'ميكروويف', blender:'خلاط', tv:'تلفزيون', laptop:'لابتوب', desktop:'كمبيوتر مكتبي', printer:'طابعة', car:'سيارة', motorcycle:'موتوسيكل', scooter:'سكوتر', smartphone:'هاتف ذكي', smartwatch:'ساعة ذكية', other:'جهاز آخر' };
    return names[type] || type;
}
function checkWarranty(purchaseDate, months) {
    if (!months || months === 0 || !purchaseDate) return { valid: false, text: 'بدون ضمان' };
    const expiry = new Date(purchaseDate);
    expiry.setMonth(expiry.getMonth() + parseInt(months));
    const now = new Date();
    if (expiry > now) {
        const remaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return { valid: true, text: `متبقي ${remaining} يوم` };
    }
    return { valid: false, text: 'منتهي' };
}
function getNextMaintenance(purchaseDate, interval) {
    if (!interval || interval === '0' || !purchaseDate) return null;
    const start = new Date(purchaseDate);
    const now = new Date();
    let next = new Date(start);
    while (next <= now) next.setMonth(next.getMonth() + parseInt(interval));
    const remaining = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
    return { date: next, remaining };
}
function showNotification(msg, type) {
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#2563EB';
    const n = document.createElement('div');
    n.textContent = msg;
    Object.assign(n.style, { position:'fixed', top:'30px', left:'50%', transform:'translateX(-50%)', background:bg, color:'white', padding:'12px 24px', borderRadius:'50px', zIndex:'9999', fontWeight:'bold' });
    document.body.appendChild(n);
    setTimeout(() => { n.remove(); }, 3000);
}
function logout() { localStorage.removeItem('shakhesly_current_user'); window.location.href = 'index.html'; }
