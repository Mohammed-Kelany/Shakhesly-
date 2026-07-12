
/* ============================================
   شخصلي AI - تفاعلات صفحة أجهزتي
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== التحقق من تسجيل الدخول ==========
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // ========== تحميل الأجهزة ==========
    loadDevices();
    updateStats();

    // ========== فتح نافذة إضافة جهاز ==========
    document.getElementById('btnAddDevice').addEventListener('click', openAddModal);
    document.getElementById('btnAddFirstDevice').addEventListener('click', openAddModal);
    
    // ========== إغلاق النوافذ ==========
    document.getElementById('modalClose').addEventListener('click', closeDeviceModal);
    document.getElementById('btnCancel').addEventListener('click', closeDeviceModal);
    document.getElementById('btnCancelDelete').addEventListener('click', closeDeleteModal);
    
    document.getElementById('deviceModal').addEventListener('click', function(e) {
        if (e.target === this) closeDeviceModal();
    });
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) closeDeleteModal();
    });

    // ========== حفظ الجهاز ==========
    document.getElementById('deviceForm').addEventListener('submit', saveDevice);

    // ========== فلترة وبحث ==========
    document.getElementById('searchDevice').addEventListener('input', loadDevices);
    document.getElementById('filterType').addEventListener('change', loadDevices);
    document.getElementById('filterStatus').addEventListener('change', loadDevices);
});

/* ==============================
   دوال مساعدة
   ============================== */

// جلب الأجهزة من localStorage
function getDevices() {
    const userId = JSON.parse(localStorage.getItem('shakhesly_current_user')).id;
    const allDevices = JSON.parse(localStorage.getItem('shakhesly_devices')) || [];
    return allDevices.filter(d => d.userId === userId || d.userId === undefined);
}

// حفظ الأجهزة في localStorage
function saveDevices(devices) {
    const userId = JSON.parse(localStorage.getItem('shakhesly_current_user')).id;
    const allDevices = JSON.parse(localStorage.getItem('shakhesly_devices')) || [];
    const otherDevices = allDevices.filter(d => d.userId !== userId && d.userId !== undefined);
    localStorage.setItem('shakhesly_devices', JSON.stringify([...otherDevices, ...devices]));
}

// أيقونة حسب نوع الجهاز
function getDeviceIcon(type) {
    function getDeviceIcon(type) {
    const icons = {
        fridge: '❄️', freezer: '🧊', washer: '🌀', 'washer-semi': '🔄',
        dryer: '👕', dishwasher: '🍽️', ac: '🌬️', 'ac-central': '🏢',
        'water-heater': '💧', 'water-heater-gas': '🔥', 'water-cooler': '🚰',
        'water-pump': '💦', oven: '🔥', microwave: '📡', 'cooker-hood': '💨',
        blender: '🥤', 'coffee-maker': '☕', toaster: '🍞',
        'food-processor': '🍴', juicer: '🧃', 'rice-cooker': '🍚',
        'air-fryer': '🍗', 'electric-oven': '♨️', kettle: '🫖',
        tv: '📺', receiver: '📡', 'sound-system': '🔊',
        'home-theater': '🎬', projector: '📽️', camera: '📷',
        drone: '🛸', 'gaming-console': '🎮', laptop: '💻',
        desktop: '🖥️', tablet: '📱', printer: '🖨️', scanner: '📠',
        monitor: '🖥️', router: '📶', nas: '🗄️', vacuum: '🧹',
        'robot-vacuum': '🤖', iron: '👔', 'steam-iron': '💨',
        fan: '🌀', 'ceiling-fan': '🔃', 'sewing-machine': '🧵',
        heater: '🔥', 'air-purifier': '🍃', humidifier: '💧',
        dslr: '📸', mirrorless: '📷', 'action-cam': '🎬',
        instax: '🖼️', lens: '🔍', gimbal: '🎥', 'ring-light': '💡',
        car: '🚗', motorcycle: '🏍️', scooter: '🛵', truck: '🚚',
        bus: '🚌', 'tuk-tuk': '🛺', bicycle: '🚲', 'electric-bike': '⚡',
        generator: '⚡', ups: '🔋', welder: '💥', drill: '🔩',
        compressor: '💨', 'solar-panel': '☀️', smartphone: '📱',
        smartwatch: '⌚', 'smart-speaker': '🔊', 'smart-lock': '🔐',
        'smart-light': '💡', 'smart-thermostat': '🌡️', other: '📦'
    };
    return icons[type] || '📦';
} 

}

// اسم النوع بالعربي
function getDeviceTypeName(type) {
    const names = {
        fridge: 'ثلاجة', freezer: 'ديب فريزر', washer: 'غسالة أتوماتيك',
        'washer-semi': 'غسالة نصف أتوماتيك', dryer: 'مجفف ملابس',
        dishwasher: 'غسالة أطباق', ac: 'مكيف هواء', 'ac-central': 'مكيف مركزي',
        'water-heater': 'سخان مياه (كهرباء)', 'water-heater-gas': 'سخان مياه (غاز)',
        'water-cooler': 'مبرد مياه', 'water-pump': 'مضخة مياه',
        oven: 'فرن / بوتاجاز', microwave: 'ميكروويف', 'cooker-hood': 'شفاط مطبخ',
        blender: 'خلاط / كبة', 'coffee-maker': 'ماكينة قهوة', toaster: 'محمصة خبز',
        'food-processor': 'محضر طعام', juicer: 'عصارة', 'rice-cooker': 'طباخ أرز',
        'air-fryer': 'مقلاة هوائية', 'electric-oven': 'فرن كهربائي', kettle: 'غلاية مياه',
        tv: 'تلفزيون / شاشة', receiver: 'رسيفر', 'sound-system': 'نظام صوتي',
        'home-theater': 'هوم ثياتر', projector: 'بروجيكتور', camera: 'كاميرا',
        drone: 'درون', 'gaming-console': 'جهاز ألعاب',
        laptop: 'لابتوب', desktop: 'كمبيوتر مكتبي', tablet: 'تابلت',
        printer: 'طابعة', scanner: 'سكانر', monitor: 'شاشة كمبيوتر',
        router: 'راوتر إنترنت', nas: 'خادم تخزين NAS',
        vacuum: 'مكنسة كهربائية', 'robot-vacuum': 'مكنسة روبوت',
        iron: 'مكواة', 'steam-iron': 'مكواة بخار', fan: 'مروحة',
        'ceiling-fan': 'مروحة سقف', 'sewing-machine': 'ماكينة خياطة',
        heater: 'دفاية', 'air-purifier': 'منقي هواء', humidifier: 'مرطب هواء',
        dslr: 'كاميرا DSLR', mirrorless: 'كاميرا ميرورلس', 'action-cam': 'كاميرا أكشن',
        instax: 'كاميرا فورية', lens: 'عدسة', gimbal: 'جيمبال / مثبت', 'ring-light': 'رينج لايت',
        car: 'سيارة', motorcycle: 'موتوسيكل', scooter: 'سكوتر',
        truck: 'شاحنة / نقل', bus: 'أتوبيس / ميكروباص', 'tuk-tuk': 'توك توك',
        bicycle: 'دراجة', 'electric-bike': 'دراجة كهربائية',
        generator: 'مولد كهرباء', ups: 'بطارية UPS', welder: 'ماكينة لحام',
        drill: 'مثقاب / شنيور', compressor: 'كمبروسر هواء', 'solar-panel': 'لوح طاقة شمسية',
        smartphone: 'هاتف ذكي', smartwatch: 'ساعة ذكية', 'smart-speaker': 'سماعة ذكية',
        'smart-lock': 'قفل ذكي', 'smart-light': 'إضاءة ذكية', 'smart-thermostat': 'ثرموستات ذكي',
        other: 'جهاز آخر'
    };
    return names[type] || type;
} 


// التحقق من الضمان
function checkWarranty(purchaseDate, warrantyMonths) {
    if (!warrantyMonths || warrantyMonths === 0) return { valid: false, text: 'بدون ضمان' };
    const purchase = new Date(purchaseDate);
    const expiry = new Date(purchase.setMonth(purchase.getMonth() + parseInt(warrantyMonths)));
    const now = new Date();
    if (expiry > now) {
        const remaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return { valid: true, text: `متبقي ${remaining} يوم` };
    }
    return { valid: false, text: 'منتهي' };
}

// حساب الصيانة القادمة
function getNextMaintenance(purchaseDate, intervalMonths) {
    if (!intervalMonths || intervalMonths === '0') return null;
    const purchase = new Date(purchaseDate);
    const now = new Date();
    let next = new Date(purchase);
    while (next <= now) {
        next.setMonth(next.getMonth() + parseInt(intervalMonths));
    }
    const remaining = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
    return { date: next, remaining };
}

/* ==============================
   تحميل وعرض الأجهزة
   ============================== */
function loadDevices() {
    const devices = getDevices();
    const grid = document.getElementById('devicesGrid');
    const empty = document.getElementById('emptyState');
    
    // فلترة
    const searchTerm = document.getElementById('searchDevice').value.toLowerCase();
    const filterType = document.getElementById('filterType').value;
    const filterStatus = document.getElementById('filterStatus').value;
    
    let filtered = devices;
    
    if (searchTerm) {
        filtered = filtered.filter(d => 
            d.brand.toLowerCase().includes(searchTerm) ||
            d.model.toLowerCase().includes(searchTerm) ||
            getDeviceTypeName(d.type).includes(searchTerm)
        );
    }
    
    if (filterType !== 'all') {
        filtered = filtered.filter(d => d.type === filterType);
    }
    
    if (filterStatus === 'active') {
        filtered = filtered.filter(d => d.status === 'active');
    } else if (filterStatus === 'maintenance') {
        filtered = filtered.filter(d => d.status === 'maintenance');
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        grid.innerHTML = filtered.map(device => createDeviceCard(device)).join('');
        
        // ربط أزرار كل كرت
        filtered.forEach(device => {
            document.getElementById(`diagnose-${device.id}`)?.addEventListener('click', () => {
                window.location.href = `diagnose.html?device=${device.id}`;
            });
            document.getElementById(`edit-${device.id}`)?.addEventListener('click', () => openEditModal(device.id));
            document.getElementById(`delete-${device.id}`)?.addEventListener('click', () => openDeleteModal(device.id));
            document.getElementById(`mark-maintenance-${device.id}`)?.addEventListener('click', () => toggleMaintenance(device.id));
        });
    }
    
    updateStats();
}

/* ==============================
   إنشاء كرت الجهاز
   ============================== */
function createDeviceCard(device) {
    const warranty = checkWarranty(device.purchaseDate, device.warrantyMonths);
    const nextMaintenance = getNextMaintenance(device.purchaseDate, device.maintenanceInterval);
    
    const statusClass = device.status === 'active' ? 'status-active' : 'status-maintenance';
    const statusText = device.status === 'active' ? '✅ سليم' : '🔧 يحتاج صيانة';
    
    return `
        <div class="device-card">
            <div class="device-card-header">
                <div class="device-icon">${getDeviceIcon(device.type)}</div>
                <span class="device-status ${statusClass}">${statusText}</span>
            </div>
            <div class="device-name">${device.brand} - ${device.model}</div>
            <div class="device-details">
                <div class="device-detail">
                    <span class="label">النوع</span>
                    <span class="value">${getDeviceTypeName(device.type)}</span>
                </div>
                <div class="device-detail">
                    <span class="label">تاريخ الشراء</span>
                    <span class="value">${device.purchaseDate}</span>
                </div>
                <div class="device-detail">
                    <span class="label">الضمان</span>
                    <span class="value ${warranty.valid ? 'warranty-valid' : 'warranty-expired'}">${warranty.text}</span>
                </div>
                ${nextMaintenance ? `
                <div class="device-detail">
                    <span class="label">الصيانة القادمة</span>
                    <span class="value ${nextMaintenance.remaining <= 30 ? 'maintenance-soon' : ''}">بعد ${nextMaintenance.remaining} يوم</span>
                </div>` : ''}
                ${device.notes ? `
                <div class="device-detail">
                    <span class="label">ملاحظات</span>
                    <span class="value">${device.notes.substring(0, 30)}${device.notes.length > 30 ? '...' : ''}</span>
                </div>` : ''}
            </div>
            <div class="device-actions">
                <button class="btn btn-primary btn-sm" id="diagnose-${device.id}">
                    <i class="fas fa-stethoscope"></i> تشخيص
                </button>
                <button class="btn btn-outline btn-sm" id="mark-maintenance-${device.id}">
                    <i class="fas fa-tools"></i> ${device.status === 'active' ? 'طلب صيانة' : 'تم الإصلاح'}
                </button>
                <button class="btn btn-outline btn-sm" id="edit-${device.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline btn-sm" style="color:#EF4444;border-color:#EF4444;" id="delete-${device.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

/* ==============================
   إحصائيات
   ============================== */
function updateStats() {
    const devices = getDevices();
    document.getElementById('totalDevices').textContent = devices.length;
    document.getElementById('activeDevices').textContent = devices.filter(d => d.status === 'active').length;
    document.getElementById('needMaintenance').textContent = devices.filter(d => d.status === 'maintenance').length;
    
    let upcoming = 0;
    const now = new Date();
    devices.forEach(d => {
        const next = getNextMaintenance(d.purchaseDate, d.maintenanceInterval);
        if (next && next.remaining <= 30) upcoming++;
    });
    document.getElementById('upcomingMaintenance').textContent = upcoming;
}

/* ==============================
   نافذة إضافة جهاز
   ============================== */
function openAddModal() {
    document.getElementById('modalTitle').textContent = '➕ إضافة جهاز جديد';
    document.getElementById('deviceId').value = '';
    document.getElementById('deviceForm').reset();
    document.getElementById('deviceModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openEditModal(deviceId) {
    const devices = getDevices();
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
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
    document.body.style.overflow = 'hidden';
}

function closeDeviceModal() {
    document.getElementById('deviceModal').classList.remove('active');
    document.body.style.overflow = '';
}

/* ==============================
   حفظ الجهاز
   ============================== */
function saveDevice(e) {
    e.preventDefault();
    
    const deviceId = document.getElementById('deviceId').value;
    const deviceData = {
        id: deviceId ? parseInt(deviceId) : Date.now(),
        userId: JSON.parse(localStorage.getItem('shakhesly_current_user')).id,
        type: document.getElementById('deviceType').value,
        brand: document.getElementById('deviceBrand').value.trim(),
        model: document.getElementById('deviceModel').value.trim(),
        purchaseDate: document.getElementById('purchaseDate').value,
        warrantyMonths: document.getElementById('warrantyMonths').value,
        notes: document.getElementById('deviceNotes').value.trim(),
        maintenanceInterval: document.getElementById('maintenanceInterval').value,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    // التحقق
    if (!deviceData.type || !deviceData.brand || !deviceData.model || !deviceData.purchaseDate) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    let devices = getDevices();
    
    if (deviceId) {
        // تعديل
        devices = devices.map(d => d.id === parseInt(deviceId) ? deviceData : d);
    } else {
        // إضافة جديد
        devices.push(deviceData);
    }
    
    saveDevices(devices);
    closeDeviceModal();
    loadDevices();
    showNotification(deviceId ? 'تم تعديل الجهاز بنجاح ✅' : 'تم إضافة الجهاز بنجاح 🎉', 'success');
}

/* ==============================
   نافذة الحذف
   ============================== */
let deviceToDelete = null;

function openDeleteModal(deviceId) {
    deviceToDelete = deviceId;
    document.getElementById('deleteModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    document.body.style.overflow = '';
    deviceToDelete = null;
}

document.getElementById('btnConfirmDelete').addEventListener('click', function() {
    if (deviceToDelete) {
        let devices = getDevices();
        devices = devices.filter(d => d.id !== deviceToDelete);
        saveDevices(devices);
        closeDeleteModal();
        loadDevices();
        showNotification('تم حذف الجهاز 🗑️', 'success');
    }
});

/* ==============================
   تبديل حالة الصيانة
   ============================== */
function toggleMaintenance(deviceId) {
    let devices = getDevices();
    devices = devices.map(d => {
        if (d.id === deviceId) {
            d.status = d.status === 'active' ? 'maintenance' : 'active';
        }
        return d;
    });
    saveDevices(devices);
    loadDevices();
    showNotification('تم تحديث حالة الجهاز ✅', 'success');
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
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#2563EB';
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '💡';
    const n = document.createElement('div');
    n.className = 'notification';
    n.textContent = `${icon} ${message}`;
    Object.assign(n.style, {
        position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
        background: bg, color: 'white', padding: '14px 24px', borderRadius: '50px',
        zIndex: '9999', fontWeight: '700', fontSize: '0.95rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    });
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = '0.3s'; setTimeout(() => n.remove(), 300); }, 3000);
} 
