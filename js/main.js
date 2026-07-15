/* ============================================
   شخصلي AI - JavaScript الرئيسي
   الإصدار: 10.1 (Firebase + إشعارات + سلايدر + تذكير)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
    initMobileMenu();
    initHeaderScroll();
    initRegisterModal();
    initCounters();
    initSmoothScroll();
    initActiveNavLink();
    initRegisterForm();
    initFileUploads();
    initDeviceSlider();
    initExtraEffects();
    checkMaintenanceReminders();
    console.log('🚀 شخصلي AI - المنصة جاهزة للعمل');
});

const SECRET_KEY = 'ShakheslyAI2024SecretKey!@#';

function encryptPassword(password) {
    if (typeof CryptoJS !== 'undefined') return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return password;
}

function decryptPassword(encryptedPassword) {
    try {
        if (typeof CryptoJS !== 'undefined') {
            const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        }
        return encryptedPassword;
    } catch(e) { return encryptedPassword; }
}

/* ==============================
   1. القائمة المتجاوبة للجوال
   ============================== */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('nav');
    if (!mobileToggle || !nav) return;
    mobileToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ==============================
   2. تأثير التمرير على الهيدر
   ============================== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.pageYOffset > 50));
}

/* ==============================
   3. نافذة التسجيل المنبثقة
   ============================== */
function initRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (!modal) return;
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    
    function openUserModal() {
        if (modalTitle) modalTitle.textContent = 'تسجيل مستخدم جديد';
        document.getElementById('techExtraFields').style.display = 'none';
        document.getElementById('registerForm').reset();
        resetFileUploads();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function openTechModal() {
        if (modalTitle) modalTitle.textContent = 'تسجيل فني معتمد';
        document.getElementById('techExtraFields').style.display = 'block';
        document.getElementById('registerForm').reset();
        resetFileUploads();
        resetCheckboxes();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() { modal.classList.remove('active'); document.body.style.overflow = ''; }
    
    function resetFileUploads() {
        document.getElementById('frontIdPreview')?.classList.remove('show');
        document.getElementById('backIdPreview')?.classList.remove('show');
        const frontUpload = document.getElementById('frontIdUpload');
        const backUpload = document.getElementById('backIdUpload');
        if (frontUpload) { frontUpload.classList.remove('has-file'); frontUpload.querySelector('span').textContent = 'اضغط لرفع صورة وش البطاقة'; }
        if (backUpload) { backUpload.classList.remove('has-file'); backUpload.querySelector('span').textContent = 'اضغط لرفع صورة ظهر البطاقة'; }
    }
    
    function resetCheckboxes() {
        document.querySelectorAll('#specializationCheckboxes input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    }
    
    document.getElementById('btnUserRegister')?.addEventListener('click', openUserModal);
    document.getElementById('btnRegisterUser')?.addEventListener('click', openUserModal);
    document.getElementById('btnHeroRegister')?.addEventListener('click', openUserModal);
    document.getElementById('btnTechRegister')?.addEventListener('click', openTechModal);
    document.getElementById('btnRegisterTech')?.addEventListener('click', openTechModal);
    modalClose?.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
}

/* ==============================
   4. عداد الإحصائيات
   ============================== */
function initCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(counter.getAttribute('data-target'));
                    let current = 0;
                    const step = target / 125;
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) { counter.textContent = target.toLocaleString('en-US'); clearInterval(timer); }
                        else { counter.textContent = Math.floor(current).toLocaleString('en-US'); }
                    }, 16);
                    obs.unobserve(counter);
                }
            });
        }, { threshold: 0.5 }).observe(counter);
    });
}

/* ==============================
   5. التنقل السلس
   ============================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
            }
        });
    });
}

/* ==============================
   6. الرابط النشط
   ============================== */
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => { if (window.pageYOffset >= s.offsetTop - 150) current = s.getAttribute('id'); });
        navLinks.forEach(l => { l.classList.toggle('active', l.getAttribute('href') === `#${current}`); });
    });
}

/* ==============================
   7. نموذج التسجيل (Firebase)
   ============================== */
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;

        if (fullName.length < 3) return alert('⚠️ الرجاء إدخال اسم صحيح');
        if (!email.includes('@') || !email.includes('.')) return alert('⚠️ بريد إلكتروني صحيح');
        if (phone === '') return alert('⚠️ رقم الهاتف');
        if (password.length < 6) return alert('⚠️ كلمة المرور 6 أحرف');

        const modalTitle = document.getElementById('modalTitle');
        const userType = modalTitle && modalTitle.textContent.includes('فني') ? 'tech' : 'user';

        const newUser = {
            fullName, email, phone,
            password: encryptPassword(password),
            type: userType,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };

        if (userType === 'tech') {
            const specs = [];
            document.querySelectorAll('#specializationCheckboxes input[type="checkbox"]:checked').forEach(cb => specs.push(cb.value));
            newUser.specialization = specs.join(', ');
            newUser.experience = document.getElementById('techExperience')?.value || '';
            newUser.location = document.getElementById('techLocation')?.value || '';
            newUser.frontIdImage = document.getElementById('frontIdPreview')?.querySelector('img')?.src || '';
            newUser.backIdImage = document.getElementById('backIdPreview')?.querySelector('img')?.src || '';
        }

        db.ref('users').push(newUser)
            .then(() => {
                localStorage.setItem('shakhesly_current_user', JSON.stringify({ fullName, email, phone, type: userType }));
                document.getElementById('registerModal').classList.remove('active');
                document.body.style.overflow = '';
                form.reset();
                alert('✅ تم التسجيل بنجاح!');
                window.location.href = userType === 'tech' ? 'dashboard-tech.html' : 'dashboard-user.html';
            })
            .catch(err => { console.error(err); alert('❌ حدث خطأ'); });
    });
}

function resetAllFiles() {
    document.getElementById('frontIdPreview')?.classList.remove('show');
    document.getElementById('backIdPreview')?.classList.remove('show');
    const frontUpload = document.getElementById('frontIdUpload');
    const backUpload = document.getElementById('backIdUpload');
    if (frontUpload) { frontUpload.classList.remove('has-file'); frontUpload.querySelector('span').textContent = 'اضغط لرفع صورة وش البطاقة'; }
    if (backUpload) { backUpload.classList.remove('has-file'); backUpload.querySelector('span').textContent = 'اضغط لرفع صورة ظهر البطاقة'; }
}

function resetAllCheckboxes() {
    document.querySelectorAll('#specializationCheckboxes input[type="checkbox"]').forEach(cb => { cb.checked = false; });
}

/* ==============================
   8. تفعيل رفع صور البطاقة
   ============================== */
function initFileUploads() {
    document.getElementById('frontIdUpload')?.addEventListener('click', () => document.getElementById('frontIdImage').click());
    document.getElementById('backIdUpload')?.addEventListener('click', () => document.getElementById('backIdImage').click());
    document.getElementById('frontIdImage')?.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('frontIdPreview').querySelector('img').src = event.target.result;
                document.getElementById('frontIdPreview').classList.add('show');
                document.getElementById('frontIdUpload').classList.add('has-file');
                document.getElementById('frontIdUpload').querySelector('span').textContent = '✅ ' + e.target.files[0].name;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    document.getElementById('backIdImage')?.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('backIdPreview').querySelector('img').src = event.target.result;
                document.getElementById('backIdPreview').classList.add('show');
                document.getElementById('backIdUpload').classList.add('has-file');
                document.getElementById('backIdUpload').querySelector('span').textContent = '✅ ' + e.target.files[0].name;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

/* ==============================
   9. سلايدر الأجهزة
   ============================== */
function initDeviceSlider() {
    const items = document.querySelectorAll('.slider-item');
    if (items.length === 0) return;
    let current = 0;
    function showSlide(index) { items.forEach((item, i) => item.classList.toggle('active', i === index)); }
    setInterval(() => { current = (current + 1) % items.length; showSlide(current); }, 2500);
}

/* ==============================
   10. تذكير الصيانة الدورية
   ============================== */
function checkMaintenanceReminders() {
    var users = JSON.parse(localStorage.getItem('shakhesly_users')) || [];
    var allDevices = JSON.parse(localStorage.getItem('shakhesly_devices')) || [];
    var notifications = JSON.parse(localStorage.getItem('shakhesly_notifications')) || [];
    var today = new Date();
    
    users.forEach(function(user) {
        var userDevices = allDevices.filter(function(d) { return d.userId === user.id; });
        
        userDevices.forEach(function(device) {
            if (device.maintenanceInterval && device.maintenanceInterval !== '0' && device.purchaseDate) {
                var purchaseDate = new Date(device.purchaseDate);
                var intervalMonths = parseInt(device.maintenanceInterval);
                
                var nextMaintenance = new Date(purchaseDate);
                while (nextMaintenance <= today) {
                    nextMaintenance.setMonth(nextMaintenance.getMonth() + intervalMonths);
                }
                
                var daysUntilMaintenance = Math.ceil((nextMaintenance - today) / (1000 * 60 * 60 * 24));
                var reminderDays = [7, 3, 1];
                
                reminderDays.forEach(function(days) {
                    if (daysUntilMaintenance === days) {
                        var deviceName = (device.brand || '') + ' - ' + (device.model || '');
                        
                        var alreadyNotified = notifications.some(function(n) {
                            return n.userId === user.id && 
                                   n.deviceId === device.id && 
                                   n.reminderDays === days &&
                                   new Date(n.createdAt).toDateString() === today.toDateString();
                        });
                        
                        if (!alreadyNotified) {
                            notifications.push({
                                id: Date.now() + Math.random(),
                                userId: user.id,
                                deviceId: device.id,
                                reminderDays: days,
                                title: '🔧 تذكير صيانة دورية',
                                message: 'موعد الصيانة الدورية لجهاز ' + deviceName + ' بعد ' + days + ' ' + (days === 1 ? 'يوم' : 'أيام'),
                                type: 'maintenance',
                                link: 'devices.html',
                                read: false,
                                createdAt: new Date().toISOString()
                            });
                        }
                    }
                });
            }
        });
    });
    
    localStorage.setItem('shakhesly_notifications', JSON.stringify(notifications));
}

/* ==============================
   11. تأثيرات إضافية
   ============================== */
function initExtraEffects() {
    window.addEventListener('scroll', () => {
        document.querySelectorAll('.shape').forEach((shape, i) => shape.style.transform = `translateY(${window.pageYOffset * 0.05 * (i + 1)}px)`);
    });
}

console.log('✅ main.js تم التحميل - الإصدار 10.1');
