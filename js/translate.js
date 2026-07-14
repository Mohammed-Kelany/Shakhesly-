// ========== نظام الترجمة ==========

// قاعدة بيانات الترجمة
const translations = {
    ar: {
        // الصفحة الرئيسية
        'home': 'الرئيسية',
        'diagnose_fault': '🔍 تشخيص عطل',
        'about': 'عن شخصلي',
        'features': 'المميزات',
        'register': 'التسجيل',
        'contact': 'تواصل معنا',
        'login': 'تسجيل الدخول',
        'diagnose_device': 'شخّص جهازك',
        'register_user': 'تسجيل مستخدم',
        'register_tech': 'تسجيل فني',
        'hero_title': 'شخصلي AI <span class="highlight">مساعدك الذكي</span> لاكتشاف الأعطال',
        'hero_subtitle': 'اكتشف أعطال أجهزتك خلال ثوانٍ باستخدام الذكاء الاصطناعي عبر الكتابة أو الصوت أو الكاميرا',
        'diagnose_now': 'شخّص جهازك الآن',
        'start_free': 'ابدأ الآن مجاناً',
        'watch_video': 'شاهد الفيديو التعريفي',
        'successful_diagnoses': 'تشخيص ناجح',
        'certified_techs': 'فني معتمد',
        'satisfaction_rate': 'نسبة رضا',
        'diagnosis_methods': 'طرق تشخيص الأعطال',
        'three_methods': 'ثلاث طرق ذكية لتشخيص أعطال أجهزتك',
        'write_problem': 'اكتب المشكلة',
        'write_desc': 'اكتب وصف المشكلة وسنقوم بتحليلها فوراً',
        'voice_search': 'البحث الصوتي',
        'voice_desc': 'تحدث عن المشكلة وسنستمع ونحللها بدقة',
        'use_camera': 'استخدم الكاميرا',
        'camera_desc': 'صوّر الجهاز وسنحلل المشكلة تلقائياً',
        'try_now': 'جرب الآن',
        'platform_features': 'مميزات المنصة الذكية',
        'features_desc': 'كل ما تحتاجه لإدارة أجهزتك وصيانتها',
        'certified_technicians': 'فنيون معتمدون',
        'certified_desc': 'تواصل مع فنيين محترفين معتمدين في منطقتك',
        'device_management': 'إدارة أجهزتك',
        'device_desc': 'أضف جميع أجهزتك وتابع حالتها بسهولة',
        'maintenance_reminder': 'تذكير الصيانة الدورية',
        'maintenance_desc': 'نذكرك بمواعيد صيانة كل جهاز تلقائياً',
        'join_network': 'انضم إلى شبكة شخصلي',
        'join_desc': 'واستقبل طلبات الصيانة من عملاء قريبين منك',
        'register_as_tech': 'سجل كفني الآن',
        'register_devices': 'سجّل أجهزتك الآن',
        'register_desc': 'واحصل على تذكيرات الصيانة الدورية وتشخيص الأعطال',
        'register_now': 'سجل الآن مجاناً',
        'download_app': 'حمل التطبيق',
        'available_stores': 'متوفر على جميع المتاجر',
        'quick_links': 'روابط سريعة',
        'about_shakhesly': 'منصة ذكية لاكتشاف الأعطال وإدارتها باستخدام الذكاء الاصطناعي',
        'all_rights': '© 2024 شخصلي. جميع الحقوق محفوظة',
        'ai_powered': 'AI Powered',
        'increase_income': 'زيادة دخلك الشهري',
        'new_clients': 'عملاء جدد يومياً',
        'management_system': 'نظام إدارة طلبات متكامل',
        'free_diagnosis': 'تشخيص مجاني للأعطال',
        'maintenance_alerts': 'تذكير بالصيانة الدورية',
        'local_tech': 'فني معتمد في منطقتك',
    },
    en: {
        'home': 'Home',
        'diagnose_fault': '🔍 Diagnose Fault',
        'about': 'About Shakhesly',
        'features': 'Features',
        'register': 'Register',
        'contact': 'Contact Us',
        'login': 'Login',
        'diagnose_device': 'Diagnose Device',
        'register_user': 'Register User',
        'register_tech': 'Register Tech',
        'hero_title': 'Shakhesly AI <span class="highlight">Your Smart Assistant</span> for Fault Detection',
        'hero_subtitle': 'Discover your device faults in seconds using AI via text, voice, or camera',
        'diagnose_now': 'Diagnose Your Device Now',
        'start_free': 'Start Free Now',
        'watch_video': 'Watch Intro Video',
        'successful_diagnoses': 'Successful Diagnoses',
        'certified_techs': 'Certified Technicians',
        'satisfaction_rate': 'Satisfaction Rate',
        'diagnosis_methods': 'Diagnosis Methods',
        'three_methods': 'Three smart ways to diagnose your device faults',
        'write_problem': 'Write the Problem',
        'write_desc': 'Write a description of the problem and we will analyze it instantly',
        'voice_search': 'Voice Search',
        'voice_desc': 'Speak about the problem and we will listen and analyze it accurately',
        'use_camera': 'Use Camera',
        'camera_desc': 'Take a photo of the device and we will analyze the problem automatically',
        'try_now': 'Try Now',
        'platform_features': 'Smart Platform Features',
        'features_desc': 'Everything you need to manage and maintain your devices',
        'certified_technicians': 'Certified Technicians',
        'certified_desc': 'Connect with professional certified technicians in your area',
        'device_management': 'Device Management',
        'device_desc': 'Add all your devices and easily track their status',
        'maintenance_reminder': 'Maintenance Reminders',
        'maintenance_desc': 'We automatically remind you of maintenance dates for each device',
        'join_network': 'Join Shakhesly Network',
        'join_desc': 'Receive maintenance requests from nearby clients',
        'register_as_tech': 'Register as Technician',
        'register_devices': 'Register Your Devices Now',
        'register_desc': 'Get maintenance reminders and fault diagnosis',
        'register_now': 'Register Now Free',
        'download_app': 'Download the App',
        'available_stores': 'Available on all stores',
        'quick_links': 'Quick Links',
        'about_shakhesly': 'Smart platform for fault detection and management using AI',
        'all_rights': '© 2024 Shakhesly. All Rights Reserved',
        'ai_powered': 'AI Powered',
        'increase_income': 'Increase your monthly income',
        'new_clients': 'New clients daily',
        'management_system': 'Integrated request management system',
        'free_diagnosis': 'Free fault diagnosis',
        'maintenance_alerts': 'Periodic maintenance reminders',
        'local_tech': 'Certified technician in your area',
    }
};

// الحصول على اللغة الحالية
function getCurrentLanguage() {
    return localStorage.getItem('shakhesly_language') || 'ar';
}

// حفظ اللغة
function setLanguage(lang) {
    localStorage.setItem('shakhesly_language', lang);
    location.reload();
}

// تطبيق الترجمة على العناصر اللي فيها data-translate
function applyTranslations() {
    const lang = getCurrentLanguage();
    
    // تغيير اتجاه الصفحة
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // ترجمة العناصر اللي فيها data-translate (يدعم innerHTML)
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang]?.[key]) {
            // استخدم innerHTML عشان يدعم <span> و <strong> وغيره
            el.innerHTML = translations[lang][key];
        }
    });
    
    // ترجمة placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (translations[lang]?.[key]) {
            el.placeholder = translations[lang][key];
        }
    });
    
    // ترجمة title
    document.querySelectorAll('[data-translate-title]').forEach(el => {
        const key = el.getAttribute('data-translate-title');
        if (translations[lang]?.[key]) {
            el.title = translations[lang][key];
        }
    });
}

// إضافة زر تغيير اللغة
function addLanguageToggle() {
    const container = document.querySelector('.header-actions');
    if (!container) return;
    
    const currentLang = getCurrentLanguage();
    
    const langBtn = document.createElement('button');
    langBtn.className = 'btn btn-outline';
    langBtn.style.cssText = 'padding:8px 12px;font-size:0.85rem;';
    langBtn.innerHTML = currentLang === 'ar' ? '🇬🇧 EN' : '🇸🇦 AR';
    langBtn.title = currentLang === 'ar' ? 'Switch to English' : 'التبديل للعربية';
    
    langBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
    });
    
    container.prepend(langBtn);
}

// تشغيل الترجمة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    applyTranslations();
    addLanguageToggle();
});
