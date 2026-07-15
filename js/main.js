/* ============================================
   شخصلي AI - JavaScript الرئيسي
   الإصدار: 9.0 (مع سلايدر الأجهزة)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 100 });
    }
    
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

    console.log('🚀 شخصلي AI - المنصة جاهزة للعمل');
});

/* ==============================
   مفتاح التشفير السري
   ============================== */
const SECRET_KEY = 'ShakheslyAI2024SecretKey!@#';

/* ==============================
   دوال تشفير وفك تشفير كلمة المرور
   ============================== */
function encryptPassword(password) {
    if (typeof CryptoJS !== 'undefined') {
        return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    }
    return password;
}

function decryptPassword(encryptedPassword) {
    try {
        if (typeof CryptoJS !== 'undefined') {
            const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        }
        return encryptedPassword;
    } catch(e) {
        return encryptedPassword;
    }
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
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function resetFileUploads() {
        document.getElementById('frontIdPreview')?.classList.remove('show');
        document.getElementById('backIdPreview')?.classList.remove('show');
        const frontUpload = document.getElementById('frontIdUpload');
        const backUpload = document.getElementById('backIdUpload');
        if (frontUpload) {
            frontUpload.classList.remove('has-file');
            frontUpload.querySelector('span').textContent = 'اضغط لرفع صورة وش البطاقة';
        }
        if (backUpload) {
            backUpload.classList.remove('has-file');
            backUpload.querySelector('span').textContent = 'اضغط لرفع صورة ظهر البطاقة';
        }
    }
    
    function resetCheckboxes() {
        document.querySelectorAll('#specializationCheckboxes input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
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
                        if (current >= target) { 
                            counter.textContent = target.toLocaleString('en-US'); 
                            clearInterval(timer); 
                        } else { 
                            counter.textContent = Math.floor(current).toLocaleString('en-US'); 
                        }
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
   7. نموذج التسجيل
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

        if (fullName.length < 3) return alert('⚠️ الرجاء إدخال اسم صحيح (3 أحرف على الأقل)');
        if (!email.includes('@') || !email.includes('.')) return alert('⚠️ الرجاء إدخال بريد إلكتروني صحيح');
        if (phone === '') return alert('⚠️ الرجاء إدخال رقم الهاتف');
        if (password.length < 6) return alert('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل');

        const modalTitle = document.getElementById('modalTitle');
        const userType = modalTitle && modalTitle.textContent.includes('فني') ? 'tech' : 'user';

        let users = [];
        try { users = JSON.parse(localStorage.getItem('shakhesly_users')) || []; } catch(err) { users = []; }
        
        const newUser = {
            id: Date.now(),
            fullName: fullName,
            email: email,
            phone: phone,
            password: encryptPassword(password),
            type: userType,
            createdAt: new Date().toISOString()
        };
        
        if (userType === 'tech') {
            const selectedSpecs = [];
            document.querySelectorAll('#specializationCheckboxes input[type="checkbox"]:checked').forEach(cb => {
                selectedSpecs.push(cb.value);
            });
            newUser.specialization = selectedSpecs.join(', ');
            newUser.experience = document.getElementById('techExperience')?.value || '';
            newUser.location = document.getElementById('techLocation')?.value || '';
            newUser.frontIdImage = document.getElementById('frontIdPreview')?.querySelector('img')?.src || '';
            newUser.backIdImage = document.getElementById('backIdPreview')?.querySelector('img')?.src || '';
        }
        
        users.push(newUser);
        localStorage.setItem('shakhesly_users', JSON.stringify(users));

        localStorage.setItem('shakhesly_current_user', JSON.stringify({
            id: newUser.id,
            fullName: fullName,
            email: email,
            phone: phone,
            type: userType,
            specialization: newUser.specialization || '',
            experience: newUser.experience || '',
            location: newUser.location || ''
        }));

        document.getElementById('registerModal').classList.remove('active');
        document.body.style.overflow = '';
        form.reset();
        document.getElementById('techExtraFields').style.display = 'none';
        resetAllFiles();
        resetAllCheckboxes();

        alert('✅ تم التسجيل بنجاح! مرحباً بك في شخصلي.');
        
        const targetPage = userType === 'tech' ? 'dashboard-tech.html' : 'dashboard-user.html';
        window.location.href = targetPage;
    });
}

function resetAllFiles() {
    document.getElementById('frontIdPreview')?.classList.remove('show');
    document.getElementById('backIdPreview')?.classList.remove('show');
    const frontUpload = document.getElementById('frontIdUpload');
    const backUpload = document.getElementById('backIdUpload');
    if (frontUpload) {
        frontUpload.classList.remove('has-file');
        frontUpload.querySelector('span').textContent = 'اضغط لرفع صورة وش البطاقة';
    }
    if (backUpload) {
        backUpload.classList.remove('has-file');
        backUpload.querySelector('span').textContent = 'اضغط لرفع صورة ظهر البطاقة';
    }
}

function resetAllCheckboxes() {
    document.querySelectorAll('#specializationCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
}

/* ==============================
   8. تفعيل رفع صور البطاقة
   ============================== */
function initFileUploads() {
    document.getElementById('frontIdUpload')?.addEventListener('click', function() {
        document.getElementById('frontIdImage').click();
    });
    
    document.getElementById('backIdUpload')?.addEventListener('click', function() {
        document.getElementById('backIdImage').click();
    });
    
    document.getElementById('frontIdImage')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('frontIdPreview');
                const upload = document.getElementById('frontIdUpload');
                preview.querySelector('img').src = event.target.result;
                preview.classList.add('show');
                upload.classList.add('has-file');
                upload.querySelector('span').textContent = '✅ ' + file.name;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('backIdImage')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.getElementById('backIdPreview');
                const upload = document.getElementById('backIdUpload');
                preview.querySelector('img').src = event.target.result;
                preview.classList.add('show');
                upload.classList.add('has-file');
                upload.querySelector('span').textContent = '✅ ' + file.name;
            };
            reader.readAsDataURL(file);
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
    const total = items.length;
    
    function showSlide(index) {
        items.forEach(item => item.classList.remove('active'));
        items[index].classList.add('active');
    }
    
    setInterval(() => {
        current = (current + 1) % total;
        showSlide(current);
    }, 2500);
}

/* ==============================
   10. تأثيرات إضافية
   ============================== */
function initExtraEffects() {
    window.addEventListener('scroll', () => {
        document.querySelectorAll('.shape').forEach((shape, i) => {
            shape.style.transform = `translateY(${window.pageYOffset * 0.05 * (i+1)}px)`;
        });
    });
}

console.log('✅ main.js تم التحميل - الإصدار 9.0');
console.log('📋 عدد المستخدمين:', (JSON.parse(localStorage.getItem('shakhesly_users')) || []).length); 

// 🆕 إرسال Push Notification
function sendPushNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body: body, icon: 'assets/images/icon-192.png' });
  }
}

// استخدامها في checkMaintenanceReminders:
sendPushNotification('🔧 تذكير صيانة', 'موعد الصيانة الدورية لجهاز ' + deviceName + ' بعد ' + days + ' يوم');
