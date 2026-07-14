/* ============================================
   شخصلي AI - تفاعلات صفحة تشخيص الأعطال
   الإصدار: 5.4 (كاميرا + فيديوهات يوتيوب + Firebase)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }

    const btnDiagnose = document.getElementById('btnDiagnose');
    const btnVoice = document.getElementById('btnVoice');
    const btnCamera = document.getElementById('btnCamera');
    const imageInput = document.getElementById('imageInput');
    const cameraInput = document.getElementById('cameraInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const btnRemoveImage = document.getElementById('btnRemoveImage');

    // ========== زر التشخيص ==========
    if (btnDiagnose) {
        btnDiagnose.addEventListener('click', function() {
            const device = document.getElementById('deviceSelect').value;
            const problem = document.getElementById('problemDesc').value.trim();
            
            if (!device) return alert('⚠️ الرجاء اختيار الجهاز');
            if (problem.length < 5) return alert('⚠️ الرجاء كتابة وصف المشكلة (5 أحرف على الأقل)');
            
            startDiagnosis(device, problem);
        });
    }

    // ========== زر التسجيل الصوتي ==========
    if (btnVoice) {
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
    }

    // ========== زر الكاميرا (نافذة اختيار المصدر) ==========
    if (btnCamera) {
        btnCamera.addEventListener('click', function() {
            showImageSourceOptions();
        });
    }

    function showImageSourceOptions() {
        const oldOverlay = document.getElementById('cameraOptionsOverlay');
        if (oldOverlay) oldOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'cameraOptionsOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 20px; padding: 30px;
            width: 90%; max-width: 400px; text-align: center;
            position: relative; direction: rtl; font-family: 'Cairo', sans-serif;
        `;
        modal.innerHTML = `
            <button id="closeImageOptions" style="position:absolute;top:10px;left:10px;background:#f1f5f9;border:none;width:36px;height:36px;border-radius:50%;font-size:1.5rem;cursor:pointer;">&times;</button>
            <h3 style="font-size:1.3rem;font-weight:800;margin-bottom:10px;">📷 اختر مصدر الصورة</h3>
            <p style="color:#64748B;margin-bottom:20px;">كيف تريد إضافة صورة الجهاز؟</p>
            <button id="btnOpenCamera" style="width:100%;padding:14px;background:#2563EB;color:white;border:none;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;margin-bottom:12px;">
                📸 فتح الكاميرا
            </button>
            <button id="btnOpenGallery" style="width:100%;padding:14px;background:transparent;color:#2563EB;border:2px solid #2563EB;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;">
                🖼️ اختيار من المعرض
            </button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        document.getElementById('btnOpenCamera').addEventListener('click', function() {
            closeImageModal(overlay);
            if (cameraInput) {
                cameraInput.setAttribute('capture', 'environment');
                cameraInput.click();
            }
        });
        
        document.getElementById('btnOpenGallery').addEventListener('click', function() {
            closeImageModal(overlay);
            if (imageInput) {
                imageInput.click();
            }
        });
        
        document.getElementById('closeImageOptions').addEventListener('click', function() {
            closeImageModal(overlay);
        });
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeImageModal(overlay);
        });
    }
    
    function closeImageModal(overlay) {
        if (overlay && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
        document.body.style.overflow = '';
    }

    // ========== معالجة الصور ==========
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                displayImagePreview(e.target.files[0]);
            }
        });
    }

    if (cameraInput) {
        cameraInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                displayImagePreview(e.target.files[0]);
            }
        });
    }

    function displayImagePreview(file) {
        if (!imagePreview || !imagePreviewContainer) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    if (btnRemoveImage) {
        btnRemoveImage.addEventListener('click', function() {
            if (imagePreview) imagePreview.src = '';
            if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            if (imageInput) imageInput.value = '';
            if (cameraInput) cameraInput.value = '';
        });
    }
    
    console.log('✅ نظام التشخيص والكاميرا جاهز');
});

// ========== دالة بدء التشخيص ==========
function startDiagnosis(device, problem) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const apiKey = document.getElementById('apiKeyInput')?.value.trim();

    if (apiKey) {
        getAIDiagnosis(device, problem, apiKey)
            .then(aiResult => {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                if (aiResult) {
                    displayResult(aiResult);
                } else {
                    const localData = (typeof data !== 'undefined' && data[device]) ? data[device] : (typeof data !== 'undefined' ? data['other'] : null);
                    if (localData) displayResult(localData);
                }
            })
            .catch(() => {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                const localData = (typeof data !== 'undefined' && data[device]) ? data[device] : (typeof data !== 'undefined' ? data['other'] : null);
                if (localData) displayResult(localData);
            });
    } else {
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            const localData = (typeof data !== 'undefined' && data[device]) ? data[device] : (typeof data !== 'undefined' ? data['other'] : null);
            if (localData) displayResult(localData);
        }, 2000);
    }
}

// ========== دالة التواصل مع OpenAI ==========
async function getAIDiagnosis(device, problem, apiKey) {
    const deviceSelect = document.getElementById('deviceSelect');
    const deviceName = deviceSelect ? deviceSelect.selectedOptions[0].text : 'الجهاز';
    
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

        const responseData = await response.json();
        if (responseData.choices && responseData.choices[0]) {
            const content = responseData.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        return null;
    } catch (error) {
        console.error('خطأ OpenAI:', error);
        return null;
    }
}

// ========== دالة عرض النتيجة ==========
function displayResult(result) {
    const resultEmpty = document.getElementById('resultEmpty');
    const resultContent = document.getElementById('resultContent');
    if (resultEmpty) resultEmpty.style.display = 'none';
    if (resultContent) resultContent.style.display = 'block';

    const diagnosisText = document.getElementById('diagnosisText');
    if (diagnosisText) diagnosisText.textContent = result.diagnosis || 'لم يتم تحديد التشخيص';
    
    const partsList = document.getElementById('partsList');
    if (partsList) {
        if (result.parts && result.parts.length > 0) {
            partsList.innerHTML = result.parts.map(p => 
                `<div class="part-item"><span>${p[0]}</span><span class="price">${p[1]}</span></div>`
            ).join('');
        } else {
            partsList.innerHTML = '<p>لا توجد قطع غيار مقترحة</p>';
        }
    }

    // ========== 🆕 فيديوهات يوتيوب حقيقية ==========
    const videosGrid = document.getElementById('videosGrid');
    if (videosGrid) {
        if (result.videos && result.videos.length > 0) {
            videosGrid.innerHTML = result.videos.map(v => {
                const searchQuery = encodeURIComponent(v + ' تصليح');
                const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
                return `
                    <a href="${youtubeUrl}" target="_blank" class="video-card" style="text-decoration:none;display:block;">
                        <div class="placeholder" style="background:#FF0000;color:white;display:flex;align-items:center;justify-content:center;height:100px;border-radius:10px;font-size:2rem;">
                            ▶️
                        </div>
                        <span style="display:block;padding:8px;font-size:0.85rem;font-weight:600;text-align:center;">🔍 ${v}</span>
                    </a>
                `;
            }).join('');
        } else {
            videosGrid.innerHTML = '<p>لا توجد فيديوهات مقترحة</p>';
        }
    }

    const techList = document.getElementById('techList');
    if (techList) {
        techList.innerHTML = `
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
    }

    const deviceSelect = document.getElementById('deviceSelect');
    const problemDesc = document.getElementById('problemDesc');
    if (deviceSelect && problemDesc) {
        addRequestButton(deviceSelect.value, problemDesc.value.trim());
    }
    if (result.diagnosis) {
        addSpeakButton(result.diagnosis);
    }

    if (resultContent) {
        resultContent.scrollIntoView({ behavior: 'smooth' });
    }
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
    
    const requestBtn = document.getElementById('btnRequestService');
    if (requestBtn) {
        requestBtn.addEventListener('click', function() {
            createServiceRequest(device, problem);
        });
    }
}

// ========== دالة إنشاء طلب الصيانة (Firebase) ==========
function createServiceRequest(device, problem) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) { alert('⚠️ الرجاء تسجيل الدخول أولاً'); window.location.href = 'login.html'; return; }
    
    const selectEl = document.getElementById('deviceSelect');
    const deviceName = selectEl ? selectEl.options[selectEl.selectedIndex].text : 'جهاز';
    const deviceType = selectEl ? selectEl.value : 'other';
    
    const newOrder = {
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
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    db.ref('orders').push(newOrder)
        .then(() => {
            alert('✅ تم إرسال طلب الصيانة للفنيين!\nستظهر العروض في صفحة "طلباتي" قريباً.');
            window.location.href = 'orders.html';
        })
        .catch(err => {
            console.error('خطأ في إرسال الطلب:', err);
            alert('❌ حدث خطأ. حاول مرة أخرى.');
        });
}

// ============================================
// قاعدة بيانات الأعطال (78 جهاز ومركبة)
// ============================================
const data = {
    fridge: { diag: 'ضعف في التبريد بسبب تراكم الثلج أو خلل في الثرموستات.', parts: [['ثرموستات','450 ج.م'],['مروحة تبريد','800 ج.م'],['حساس حرارة','250 ج.م'],['كارت تحكم','1200 ج.م']], videos: ['تصليح ثلاجة لا تبرد', 'تغيير ثرموستات الثلاجة'] },
    freezer: { diag: 'لا يجمد بشكل كافٍ. نقص غاز أو خلل في الضاغط.', parts: [['غاز فريون','400 ج.م'],['ضاغط','1800 ج.م'],['ثرموستات','350 ج.م']], videos: ['تصليح ديب فريزر', 'شحن فريون الديب فريزر'] },
    washer: { diag: 'صوت عالٍ أثناء العصر أو تسرب مياه.', parts: [['طقم بلي','550 ج.م'],['مساعدين حوض','900 ج.م'],['طلمبة تصريف','450 ج.م'],['سير','200 ج.م']], videos: ['تصليح غسالة تصدر صوت عالي', 'تغيير بلي الغسالة'] },
    dryer: { diag: 'لا يسخن. العطل في الهيتر أو الثرموستات.', parts: [['هيتر','600 ج.م'],['ثرموستات','300 ج.م'],['سير','250 ج.م']], videos: ['تصليح مجفف ملابس لا يسخن', 'تغيير هيتر المجفف'] },
    dishwasher: { diag: 'لا تنظف جيداً أو تسرب مياه.', parts: [['طلمبة مياه','500 ج.م'],['ذراع رش','250 ج.م'],['فلتر','150 ج.م']], videos: ['تصليح غسالة أطباق', 'حل مشكلة تسرب غسالة الأطباق'] },
    ac: { diag: 'لا يبرد بشكل كافٍ. نقص غاز أو اتساخ فلاتر.', parts: [['فلتر هواء','300 ج.م'],['غاز فريون R410','650 ج.م'],['كباس','2200 ج.م'],['كارت تحكم','1500 ج.م']], videos: ['تصليح مكيف لا يبرد', 'تنظيف فلتر المكيف'] },
    'water-heater': { diag: 'لا يسخن أو يفصل باستمرار.', parts: [['هيتر','400 ج.م'],['ثرموستات','250 ج.م'],['صمام أمان','180 ج.م']], videos: ['تصليح سخان مياه', 'تغيير هيتر السخان'] },
    oven: { diag: 'لا يسخن أو الشعلات لا تعمل.', parts: [['بوجيه إشعال','150 ج.م'],['صمام غاز','300 ج.م'],['ثرموستات','400 ج.م']], videos: ['تصليح فرن البوتاجاز', 'تغيير بوجيه الفرن'] },
    microwave: { diag: 'لا يسخن الطعام.', parts: [['ماجنترون','800 ج.م'],['فيوز','50 ج.م'],['كارت تحكم','600 ج.م']], videos: ['تصليح ميكروويف لا يسخن', 'تغيير فيوز الميكروويف'] },
    blender: { diag: 'لا يعمل أو الموتور ضعيف.', parts: [['موتور','300 ج.م'],['كاس','200 ج.م'],['سكينة','100 ج.م']], videos: ['تصليح خلاط لا يعمل', 'تغيير موتور الخلاط'] },
    'coffee-maker': { diag: 'لا تعمل أو تسرب مياه.', parts: [['هيتر','300 ج.م'],['طلمبة','400 ج.م'],['فلتر','100 ج.م']], videos: ['تصليح ماكينة قهوة', 'حل مشكلة تسرب القهوة'] },
    tv: { diag: 'الشاشة لا تعمل رغم وجود صوت.', parts: [['بور سبلاي','700 ج.م'],['LED باكلايت','1000 ج.م'],['كارت شاشة','800 ج.م']], videos: ['تصليح تلفزيون الشاشة سوداء', 'تغيير بور سبلاي التلفزيون'] },
    laptop: { diag: 'لا يعمل أو يسخن بسرعة.', parts: [['بطارية','900 ج.م'],['شاحن','400 ج.م'],['مروحة تبريد','250 ج.م'],['شاشة','1500 ج.م']], videos: ['تصليح لابتوب لا يعمل', 'تنظيف مروحة اللابتوب'] },
    desktop: { diag: 'لا يعمل أو يغلق فجأة.', parts: [['باور سبلاي','600 ج.م'],['رامات','500 ج.م'],['هارد ديسك','700 ج.م']], videos: ['تصليح كمبيوتر لا يعمل', 'تغيير بور سبلاي الكمبيوتر'] },
    printer: { diag: 'لا تطبع أو الورق يتحشر.', parts: [['خرطوشة حبر','350 ج.م'],['رول ورق','100 ج.م']], videos: ['تصليح طابعة لا تطبع', 'حل مشكلة تحشر الورق'] },
    car: { diag: 'المحرك لا يعمل أو يصدر صوتاً.', parts: [['بطارية','1200 ج.م'],['مارش','800 ج.م'],['دينامو','1500 ج.م'],['بوجيهات','300 ج.م']], videos: ['تصليح سيارة لا تدور', 'تغيير بطارية السيارة'] },
    motorcycle: { diag: 'لا يعمل أو السحب ضعيف.', parts: [['بطارية','400 ج.م'],['كارتير','600 ج.م'],['سلسة','300 ج.م']], videos: ['تصليح موتوسيكل لا يعمل', 'تغيير بطارية الموتوسيكل'] },
    scooter: { diag: 'لا يعمل أو البطارية تفرغ.', parts: [['بطارية','2000 ج.م'],['موتور','1500 ج.م'],['كاوتش','400 ج.م']], videos: ['تصليح سكوتر كهربائي', 'تغيير بطارية السكوتر'] },
    smartphone: { diag: 'لا يشحن أو الشاشة مكسورة.', parts: [['بطارية','400 ج.م'],['شاشة','1200 ج.م'],['بورت شحن','200 ج.م']], videos: ['تصليح هاتف لا يشحن', 'تغيير شاشة الموبايل'] },
    smartwatch: { diag: 'لا تشحن أو الشاشة لا تستجيب.', parts: [['بطارية','300 ج.م'],['شاشة','600 ج.م']], videos: ['تصليح ساعة ذكية', 'تغيير بطارية الساعة الذكية'] },
    other: { diag: 'يرجى وصف المشكلة بدقة ليتم تشخيصها بواسطة فني متخصص.', parts: [['فحص فني','200 ج.م'],['صيانة عامة','300 ج.م']], videos: ['صيانة الأجهزة المنزلية', 'تصليح الأجهزة الكهربائية'] }
};
