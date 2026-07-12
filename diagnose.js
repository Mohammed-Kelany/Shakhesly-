/* ============================================
   شخصلي AI - تفاعلات صفحة تشخيص الأعطال
   الإصدار: 5.0 (OpenAI + صوت + محلي)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    AOS.init({ duration: 800, once: true, offset: 50 });

    const btnDiagnose = document.getElementById('btnDiagnose');
    const btnVoice = document.getElementById('btnVoice');
    const btnCamera = document.getElementById('btnCamera');
    const imageInput = document.getElementById('imageInput');

    btnDiagnose.addEventListener('click', function() {
        const device = document.getElementById('deviceSelect').value;
        const problem = document.getElementById('problemDesc').value.trim();
        
        if (!device) return alert('⚠️ الرجاء اختيار الجهاز');
        if (problem.length < 5) return alert('⚠️ الرجاء كتابة وصف المشكلة (5 أحرف على الأقل)');
        
        startDiagnosis(device, problem);
    });

    btnVoice.addEventListener('click', function() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('⚠️ المتصفح لا يدعم التسجيل الصوتي');
        
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        btnVoice.innerHTML = '<i class="fas fa-microphone"></i> جاري الاستماع...';
        btnVoice.style.background = '#EF4444';
        btnVoice.style.color = 'white';
        
        recognition.onresult = function(e) { document.getElementById('problemDesc').value = e.results[0][0].transcript; };
        recognition.onerror = function() { alert('⚠️ لم نتمكن من سماعك'); };
        recognition.onend = function() { 
            btnVoice.innerHTML = '<i class="fas fa-microphone"></i> صوتي'; 
            btnVoice.style.background = ''; 
            btnVoice.style.color = ''; 
        };
        recognition.start();
    });

    btnCamera.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', e => { if (e.target.files[0]) alert('📷 تم رفع الصورة: ' + e.target.files[0].name); });
});

// ========== دالة بدء التشخيص ==========
function startDiagnosis(device, problem) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';

    // قراءة مفتاح API من الحقل السري (إن وجد)
    const apiKey = document.getElementById('apiKeyInput')?.value.trim();

    if (apiKey) {
        getAIDiagnosis(device, problem, apiKey)
            .then(aiResult => {
                loadingOverlay.style.display = 'none';
                if (aiResult) {
                    displayResult(aiResult);
                } else {
                    const localData = data[device] || data['other'];
                    displayResult(localData);
                }
            })
            .catch(() => {
                loadingOverlay.style.display = 'none';
                const localData = data[device] || data['other'];
                displayResult(localData);
            });
    } else {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            const localData = data[device] || data['other'];
            displayResult(localData);
        }, 2000);
    }
}

// ========== دالة التواصل مع OpenAI ==========
async function getAIDiagnosis(device, problem, apiKey) {
    const deviceName = document.getElementById('deviceSelect').selectedOptions[0].text;
    
    const prompt = `أنت فني صيانة خبير. مستخدم يبلغ عن مشكلة: "${problem}" في جهاز: "${deviceName}". قم بتحليل المشكلة وأعطني النتيجة بتنسيق JSON فقط:
    {
        "diagnosis": "تشخيص دقيق للمشكلة وأسبابها المحتملة بالعربية",
        "parts": [["اسم القطعة", "السعر بالجنيه المصري"], ...],
        "videos": ["عنوان فيديو للبحث على يوتيوب", ...]
    }`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error('خطأ OpenAI:', error);
        return null;
    }
}

// ========== دالة عرض النتيجة ==========
function displayResult(result) {
    document.getElementById('resultEmpty').style.display = 'none';
    document.getElementById('resultContent').style.display = 'block';

    document.getElementById('diagnosisText').textContent = result.diagnosis || 'لم يتم تحديد التشخيص';
    
    const partsList = document.getElementById('partsList');
    if (result.parts && result.parts.length > 0) {
        partsList.innerHTML = result.parts.map(p => 
            `<div class="part-item"><span>${p[0]}</span><span class="price">${p[1]}</span></div>`
        ).join('');
    } else {
        partsList.innerHTML = '<p>لا توجد قطع غيار مقترحة</p>';
    }

    const videosGrid = document.getElementById('videosGrid');
    if (result.videos && result.videos.length > 0) {
        videosGrid.innerHTML = result.videos.map(v => 
            `<div class="video-card"><div class="placeholder">🎬</div><span>${v}</span></div>`
        ).join('');
    } else {
        videosGrid.innerHTML = '<p>لا توجد فيديوهات مقترحة</p>';
    }

    document.getElementById('techList').innerHTML = `
        <div class="tech-card">
            <div class="tech-avatar">👨‍🔧</div>
            <div class="tech-info"><strong>أحمد للصيانة</strong><span>⭐ 4.8 | 📍 2.5 كم</span></div>
            <button class="btn btn-primary btn-sm">طلب</button>
        </div>
        <div class="tech-card">
            <div class="tech-avatar">👨‍💼</div>
            <div class="tech-info"><strong>مركز النخبة</strong><span>⭐ 4.6 | 📍 4.1 كم</span></div>
            <button class="btn btn-primary btn-sm">طلب</button>
        </div>
    `;

    addRequestButton(document.getElementById('deviceSelect').value, document.getElementById('problemDesc').value.trim());
    addSpeakButton(result.diagnosis);

    document.getElementById('resultContent').scrollIntoView({ behavior: 'smooth' });
}

// ========== دالة زر الصوت ==========
function addSpeakButton(text) {
    const diagnosisBox = document.querySelector('.diagnosis-box');
    if (!diagnosisBox) return;

    const oldBtn = document.getElementById('speakBtn');
    if (oldBtn) oldBtn.remove();

    const speakBtn = document.createElement('button');
    speakBtn.id = 'speakBtn';
    speakBtn.className = 'btn btn-outline btn-sm';
    speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> استمع للتشخيص';
    speakBtn.style.marginTop = '10px';
    
    speakBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
            speakBtn.innerHTML = '<i class="fas fa-pause"></i> جاري القراءة...';
            utterance.onend = () => {
                speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> استمع للتشخيص';
            };
        } else {
            alert('المتصفح لا يدعم القراءة الصوتية');
        }
    });

    diagnosisBox.appendChild(speakBtn);
}

// ========== دالة زر طلب الصيانة ==========
function addRequestButton(device, problem) {
    const requestSection = document.getElementById('requestSection');
    if (!requestSection) return;
    
    requestSection.innerHTML = `
        <button class="btn btn-primary btn-block" id="btnRequestService" style="margin-top:15px;padding:16px;font-size:1.1rem;">
            📋 طلب صيانة من الفنيين
        </button>
    `;
    
    document.getElementById('btnRequestService').addEventListener('click', function() {
        createServiceRequest(device, problem);
    });
}

// ========== دالة إنشاء طلب الصيانة ==========
function createServiceRequest(device, problem) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) { alert('⚠️ الرجاء تسجيل الدخول أولاً'); window.location.href = 'login.html'; return; }
    
    const selectEl = document.getElementById('deviceSelect');
    const deviceName = selectEl.options[selectEl.selectedIndex].text;
    const deviceType = selectEl.value;
    
    const newOrder = {
        id: Date.now(),
        userId: currentUser.id,
        customerName: currentUser.fullName,
        deviceType: deviceType,
        deviceName: deviceName,
        problem: problem,
        status: 'pending',
        bids: [],
        selectedTechId: null,
        techName: null,
        price: null,
        location: currentUser.location || 'غير محدد',
        rated: false,
        createdAt: new Date().toISOString()
    };
    
    const allOrders = JSON.parse(localStorage.getItem('shakhesly_orders')) || [];
    allOrders.push(newOrder);
    localStorage.setItem('shakhesly_orders', JSON.stringify(allOrders));
    
    alert('✅ تم إرسال طلب الصيانة للفنيين!\nستظهر العروض في صفحة "طلباتي" قريباً.');
    window.location.href = 'orders.html';
}

// ============================================
// قاعدة بيانات الأعطال (78 جهاز ومركبة) - مختصرة
// ============================================
const data = {
    fridge: { diag: 'ضعف في التبريد بسبب تراكم الثلج أو خلل في الثرموستات.', parts: [['ثرموستات','450 ج.م'],['مروحة تبريد','800 ج.م'],['حساس حرارة','250 ج.م'],['كارت تحكم','1200 ج.م']] },
    freezer: { diag: 'لا يجمد بشكل كافٍ. نقص غاز أو خلل في الضاغط.', parts: [['غاز فريون','400 ج.م'],['ضاغط','1800 ج.م'],['ثرموستات','350 ج.م']] },
    washer: { diag: 'صوت عالٍ أثناء العصر أو تسرب مياه.', parts: [['طقم بلي','550 ج.م'],['مساعدين حوض','900 ج.م'],['طلمبة تصريف','450 ج.م'],['سير','200 ج.م']] },
    dryer: { diag: 'لا يسخن. العطل في الهيتر أو الثرموستات.', parts: [['هيتر','600 ج.م'],['ثرموستات','300 ج.م'],['سير','250 ج.م']] },
    dishwasher: { diag: 'لا تنظف جيداً أو تسرب مياه.', parts: [['طلمبة مياه','500 ج.م'],['ذراع رش','250 ج.م'],['فلتر','150 ج.م']] },
    ac: { diag: 'لا يبرد بشكل كافٍ. نقص غاز أو اتساخ فلاتر.', parts: [['فلتر هواء','300 ج.م'],['غاز فريون R410','650 ج.م'],['كباس','2200 ج.م'],['كارت تحكم','1500 ج.م']] },
    'water-heater': { diag: 'لا يسخن أو يفصل باستمرار.', parts: [['هيتر','400 ج.م'],['ثرموستات','250 ج.م'],['صمام أمان','180 ج.م']] },
    oven: { diag: 'لا يسخن أو الشعلات لا تعمل.', parts: [['بوجيه إشعال','150 ج.م'],['صمام غاز','300 ج.م'],['ثرموستات','400 ج.م']] },
    microwave: { diag: 'لا يسخن الطعام.', parts: [['ماجنترون','800 ج.م'],['فيوز','50 ج.م'],['كارت تحكم','600 ج.م']] },
    blender: { diag: 'لا يعمل أو الموتور ضعيف.', parts: [['موتور','300 ج.م'],['كاس','200 ج.م'],['سكينة','100 ج.م']] },
    'coffee-maker': { diag: 'لا تعمل أو تسرب مياه.', parts: [['هيتر','300 ج.م'],['طلمبة','400 ج.م'],['فلتر','100 ج.م']] },
    tv: { diag: 'الشاشة لا تعمل رغم وجود صوت.', parts: [['بور سبلاي','700 ج.م'],['LED باكلايت','1000 ج.م'],['كارت شاشة','800 ج.م']] },
    laptop: { diag: 'لا يعمل أو يسخن بسرعة.', parts: [['بطارية','900 ج.م'],['شاحن','400 ج.م'],['مروحة تبريد','250 ج.م'],['شاشة','1500 ج.م']] },
    desktop: { diag: 'لا يعمل أو يغلق فجأة.', parts: [['باور سبلاي','600 ج.م'],['رامات','500 ج.م'],['هارد ديسك','700 ج.م']] },
    printer: { diag: 'لا تطبع أو الورق يتحشر.', parts: [['خرطوشة حبر','350 ج.م'],['رول ورق','100 ج.م']] },
    car: { diag: 'المحرك لا يعمل أو يصدر صوتاً.', parts: [['بطارية','1200 ج.م'],['مارش','800 ج.م'],['دينامو','1500 ج.م'],['بوجيهات','300 ج.م']] },
    motorcycle: { diag: 'لا يعمل أو السحب ضعيف.', parts: [['بطارية','400 ج.م'],['كارتير','600 ج.م'],['سلسة','300 ج.م']] },
    scooter: { diag: 'لا يعمل أو البطارية تفرغ.', parts: [['بطارية','2000 ج.م'],['موتور','1500 ج.م'],['كاوتش','400 ج.م']] },
    smartphone: { diag: 'لا يشحن أو الشاشة مكسورة.', parts: [['بطارية','400 ج.م'],['شاشة','1200 ج.م'],['بورت شحن','200 ج.م']] },
    smartwatch: { diag: 'لا تشحن أو الشاشة لا تستجيب.', parts: [['بطارية','300 ج.م'],['شاشة','600 ج.م']] },
    other: { diag: 'يرجى وصف المشكلة بدقة ليتم تشخيصها بواسطة فني متخصص.', parts: [['فحص فني','200 ج.م'],['صيانة عامة','300 ج.م']] }
}; 
