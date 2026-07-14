/* ============================================
   شخصلي AI - قاعدة معرفة ذكية لتشخيص الأعطال
   الإصدار: 6.1 (Knowledge Base منظمة)
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true, offset: 50 });
    const btnDiagnose = document.getElementById('btnDiagnose'), btnVoice = document.getElementById('btnVoice'), btnCamera = document.getElementById('btnCamera');
    const imageInput = document.getElementById('imageInput'), cameraInput = document.getElementById('cameraInput');
    const imagePreview = document.getElementById('imagePreview'), imagePreviewContainer = document.getElementById('imagePreviewContainer'), btnRemoveImage = document.getElementById('btnRemoveImage');

    if (btnDiagnose) btnDiagnose.addEventListener('click', () => {
        const device = document.getElementById('deviceSelect').value, problem = document.getElementById('problemDesc').value.trim();
        if (!device) return alert('⚠️ الرجاء اختيار الجهاز');
        if (problem.length < 5) return alert('⚠️ الرجاء كتابة وصف المشكلة (5 أحرف على الأقل)');
        startDiagnosis(device, problem);
    });

    if (btnVoice) btnVoice.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('⚠️ المتصفح لا يدعم التسجيل الصوتي');
        const recognition = new SpeechRecognition(); recognition.lang = 'ar-SA';
        btnVoice.innerHTML = '<i class="fas fa-microphone"></i> جاري الاستماع...'; btnVoice.style.background = '#EF4444'; btnVoice.style.color = 'white';
        recognition.onresult = e => { document.getElementById('problemDesc').value = e.results[0][0].transcript; };
        recognition.onerror = () => alert('⚠️ لم نتمكن من سماعك');
        recognition.onend = () => { btnVoice.innerHTML = '<i class="fas fa-microphone"></i> صوتي'; btnVoice.style.background = ''; btnVoice.style.color = ''; };
        recognition.start();
    });

    if (btnCamera) btnCamera.addEventListener('click', showImageSourceOptions);
    function showImageSourceOptions() {
        const oldOverlay = document.getElementById('cameraOptionsOverlay'); if (oldOverlay) oldOverlay.remove();
        const overlay = document.createElement('div'); overlay.id = 'cameraOptionsOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
        const modal = document.createElement('div'); modal.style.cssText = 'background:white;border-radius:20px;padding:30px;width:90%;max-width:400px;text-align:center;position:relative;direction:rtl;font-family:Cairo,sans-serif;';
        modal.innerHTML = `<button id="closeImageOptions" style="position:absolute;top:10px;left:10px;background:#f1f5f9;border:none;width:36px;height:36px;border-radius:50%;font-size:1.5rem;cursor:pointer;">&times;</button><h3 style="font-size:1.3rem;font-weight:800;margin-bottom:10px;">📷 اختر مصدر الصورة</h3><p style="color:#64748B;margin-bottom:20px;">كيف تريد إضافة صورة الجهاز؟</p><button id="btnOpenCamera" style="width:100%;padding:14px;background:#2563EB;color:white;border:none;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;margin-bottom:12px;">📸 فتح الكاميرا</button><button id="btnOpenGallery" style="width:100%;padding:14px;background:transparent;color:#2563EB;border:2px solid #2563EB;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;">🖼️ اختيار من المعرض</button>`;
        overlay.appendChild(modal); document.body.appendChild(overlay); document.body.style.overflow = 'hidden';
        document.getElementById('btnOpenCamera').addEventListener('click', () => { closeImageModal(overlay); if(cameraInput){cameraInput.setAttribute('capture','environment');cameraInput.click();} });
        document.getElementById('btnOpenGallery').addEventListener('click', () => { closeImageModal(overlay); if(imageInput) imageInput.click(); });
        document.getElementById('closeImageOptions').addEventListener('click', () => closeImageModal(overlay));
        overlay.addEventListener('click', e => { if(e.target===overlay) closeImageModal(overlay); });
    }
    function closeImageModal(overlay) { if(overlay&&document.body.contains(overlay)) document.body.removeChild(overlay); document.body.style.overflow=''; }

    if (imageInput) imageInput.addEventListener('change', e => { if(e.target.files[0]) displayImagePreview(e.target.files[0]); });
    if (cameraInput) cameraInput.addEventListener('change', e => { if(e.target.files[0]) displayImagePreview(e.target.files[0]); });
    function displayImagePreview(file) { if(!imagePreview||!imagePreviewContainer) return; const reader=new FileReader(); reader.onload=e=>{imagePreview.src=e.target.result;imagePreviewContainer.style.display='block';}; reader.readAsDataURL(file); }
    if (btnRemoveImage) btnRemoveImage.addEventListener('click', () => { imagePreview.src=''; imagePreviewContainer.style.display='none'; imageInput.value=''; cameraInput.value=''; });
});

function startDiagnosis(device, problem) {
    const loadingOverlay = document.getElementById('loadingOverlay'); if(loadingOverlay) loadingOverlay.style.display='flex';
    const apiKey = document.getElementById('apiKeyInput')?.value.trim();
    if(apiKey) {
        getAIDiagnosis(device, problem, apiKey).then(aiResult => {
            if(loadingOverlay) loadingOverlay.style.display='none';
            displayResult(aiResult || getSmartDiagnosis(device, problem));
        }).catch(() => { if(loadingOverlay) loadingOverlay.style.display='none'; displayResult(getSmartDiagnosis(device, problem)); });
    } else {
        setTimeout(() => { if(loadingOverlay) loadingOverlay.style.display='none'; displayResult(getSmartDiagnosis(device, problem)); }, 1500);
    }
}

function getSmartDiagnosis(device, problem) {
    const kb = knowledgeBase[device] || knowledgeBase['other'];
    const problemLower = problem.toLowerCase();
    
    // 1. البحث باستخدام الكلمات المفتاحية
    for (const [keywords, solution] of Object.entries(kb.keywords || {})) {
        if (keywords.split(',').some(k => problemLower.includes(k.trim()))) {
            return { diagnosis: solution.diag, parts: solution.parts, repair: solution.repair, videos: [problem] };
        }
    }
    // 2. الرجوع للتشخيص الافتراضي للجهاز
    return { diagnosis: kb.diag, parts: kb.parts, repair: kb.repair, videos: [problem] };
}

async function getAIDiagnosis(device, problem, apiKey) {
    const deviceName = document.getElementById('deviceSelect')?.selectedOptions[0]?.text || 'الجهاز';
    const prompt = `أنت فني صيانة خبير. مستخدم يبلغ عن مشكلة: "${problem}" في جهاز: "${deviceName}". أعطني النتيجة بتنسيق JSON فقط: {"diagnosis":"تشخيص دقيق بالعربية","parts":[["اسم القطعة","السعر بالجنيه المصري"]],"repair":"خطوات الإصلاح بالعربية"}`;
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`}, body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:prompt}],temperature:0.7,max_tokens:500}) });
        const data = await res.json();
        if(data.choices?.[0]) { const match = data.choices[0].message.content.match(/\{[\s\S]*\}/); if(match) return JSON.parse(match[0]); }
        return null;
    } catch(e) { return null; }
}

function displayResult(result) {
    document.getElementById('resultEmpty').style.display='none'; document.getElementById('resultContent').style.display='block';
    document.getElementById('diagnosisText').textContent = result.diagnosis || 'لم يتم تحديد التشخيص';
    const partsList = document.getElementById('partsList');
    partsList.innerHTML = (result.parts?.length) ? result.parts.map(p => `<div class="part-item"><span>${p[0]}</span><span class="price">${p[1]}</span></div>`).join('') : '<p>لا توجد قطع غيار مقترحة</p>';
    if(result.repair) { let repairBox = document.getElementById('repairBox'); if(!repairBox){repairBox=document.createElement('div');repairBox.id='repairBox';repairBox.className='diagnosis-box';repairBox.style.cssText='background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;margin-top:12px;';document.querySelector('.card:first-child').appendChild(repairBox);} repairBox.innerHTML=`<h3 style="margin-bottom:8px;">🔧 طريقة الإصلاح المقترحة</h3><p>${result.repair}</p>`; }
    const videosGrid = document.getElementById('videosGrid');
    if(videosGrid) {
        const deviceName = document.getElementById('deviceSelect')?.selectedOptions[0]?.text || '';
        const userProblem = document.getElementById('problemDesc')?.value?.trim();
        const query = encodeURIComponent((deviceName + ' ' + userProblem + ' تصليح').trim());
        videosGrid.innerHTML = query ? `<a href="https://www.youtube.com/results?search_query=${query}" target="_blank" class="video-card" style="text-decoration:none;display:block;"><div class="placeholder" style="background:#FF0000;color:white;display:flex;align-items:center;justify-content:center;height:100px;border-radius:10px;font-size:2rem;">▶️</div><span style="display:block;padding:8px;font-size:0.85rem;font-weight:600;text-align:center;">🔍 فيديوهات يوتيوب</span></a>` : '<p>لا توجد فيديوهات مقترحة</p>';
    }
    document.getElementById('techList').innerHTML = `<div class="tech-card"><div class="tech-avatar">👨‍🔧</div><div class="tech-info"><strong>أحمد للصيانة</strong><span>⭐ 4.8 | 📍 2.5 كم</span></div><button class="btn btn-primary btn-sm">طلب</button></div><div class="tech-card"><div class="tech-avatar">👨‍💼</div><div class="tech-info"><strong>مركز النخبة</strong><span>⭐ 4.6 | 📍 4.1 كم</span></div><button class="btn btn-primary btn-sm">طلب</button></div>`;
    addRequestButton(document.getElementById('deviceSelect').value, document.getElementById('problemDesc').value.trim());
    if(result.diagnosis) addSpeakButton(result.diagnosis + ' ' + (result.repair || ''));
    document.getElementById('resultContent').scrollIntoView({behavior:'smooth'});
}

function addSpeakButton(text) {
    const box = document.querySelector('.diagnosis-box'); if(!box) return;
    const old = document.getElementById('speakBtn'); if(old) old.remove();
    const btn = document.createElement('button'); btn.id='speakBtn'; btn.className='btn btn-outline btn-sm'; btn.innerHTML='<i class="fas fa-volume-up"></i> استمع للتشخيص'; btn.style.marginTop='10px';
    btn.addEventListener('click', () => {
        if(!('speechSynthesis' in window)) return alert('المتصفح لا يدعم');
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.lang='ar-SA'; u.rate=0.9;
        const voices = speechSynthesis.getVoices();
        const male = voices.find(v => v.lang.includes('ar') && (v.name.includes('Male')||v.name.includes('Maged')||v.name.includes('Tarik')));
        u.voice = male || voices.find(v => v.lang.includes('ar'));
        speechSynthesis.speak(u); btn.innerHTML='🔊 جاري القراءة...'; u.onend = () => btn.innerHTML='<i class="fas fa-volume-up"></i> استمع للتشخيص';
    });
    box.appendChild(btn);
}

function addRequestButton(device, problem) {
    const section = document.getElementById('requestSection'); if(!section) return;
    section.innerHTML = `<button class="btn btn-primary btn-block" id="btnRequestService" style="margin-top:15px;padding:16px;font-size:1.1rem;">📋 طلب صيانة من الفنيين</button>`;
    document.getElementById('btnRequestService').addEventListener('click', () => createServiceRequest(device, problem));
}

function createServiceRequest(device, problem) {
    const user = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if(!user) { alert('⚠️ الرجاء تسجيل الدخول أولاً'); window.location.href='login.html'; return; }
    const sel = document.getElementById('deviceSelect');
    db.ref('orders').push({ userId:user.id, customerName:user.fullName, deviceType:device, deviceName:sel?.selectedOptions[0]?.text||'جهاز', problem, status:'pending', bids:[], selectedTechId:null, techName:null, price:null, location:user.location||'غير محدد', rated:false, createdAt:firebase.database.ServerValue.TIMESTAMP })
    .then(() => { alert('✅ تم إرسال طلب الصيانة للفنيين!'); window.location.href='orders.html'; }).catch(() => alert('❌ حدث خطأ'));
}

// ============================================
// قاعدة المعرفة (Knowledge Base) المنظمة
// ============================================
const knowledgeBase = {
    fridge: {
        diag: 'ضعف في أداء التبريد أو توقف كامل.',
        parts: [['غاز فريون (R134a/R600a)','400-650 ج.م'],['ثرموستات','250-450 ج.م'],['سخان نوفروست','200-400 ج.م']],
        repair: '1. فحص وتنظيف المكثف.\n2. شحن الفريون بعد التأكد من عدم وجود تسريب.\n3. استبدال الثرموستات إذا كان الموتور لا يفصل.',
        keywords: {
            'لا يبرد,سخن,حرارة,تبريد': { diag: 'نقص في غاز الفريون أو خلل في دائرة التبريد.', parts: [['غاز فريون','400-650 ج.م'],['فلتر مجفف','150-250 ج.م']], repair: 'فحص الضغط وشحن الفريون.' },
            'تجمع,ثلج,نوفروست': { diag: 'خلل في دائرة إذابة الثلج.', parts: [['سخان نوفروست','200-400 ج.م'],['ثرموديسك','100-200 ج.م']], repair: 'فحص ورفع كفاءة عناصر إذابة الثلج.' }
        }
    },
    freezer: {
        diag: 'الموتور يعمل باستمرار ولا يتوقف.',
        parts: [['ثرموستات','350-450 ج.م'],['جوان باب','200-400 ج.م']],
        repair: '1. ضبط أو استبدال منظم الحرارة.\n2. التأكد من إغلاق الباب بإحكام.',
        keywords: {
            'لا يتوقف,مستمر,دائم': { diag: 'خلل في الثرموستات أو تسريب هواء.', parts: [['ثرموستات','350-450 ج.م'],['جوان باب','200-400 ج.م']], repair: 'استبدال الثرموستات.' }
        }
    },
    washer: {
        diag: 'مشكلة في تصريف المياه أو اهتزاز أثناء العصر.',
        parts: [['طلمبة طرد مياه','450-550 ج.م'],['رولمان بلي','400-550 ج.م'],['مساعدين','300-500 ج.م']],
        repair: '1. تنظيف الفلتر.\n2. استبدال طلمبة الطرد إذا كانت لا تعمل.\n3. تغيير رولمان البلي في حالة الصوت العالي.',
        keywords: {
            'لا تطرد,مياه,تصريف': { diag: 'انسداد أو تلف طلمبة الطرد.', parts: [['طلمبة طرد مياه','450-550 ج.م']], repair: 'تنظيف الفلتر أو استبدال المضخة.' },
            'صوت,اهتزاز,عصر': { diag: 'تآكل في رولمان البلي.', parts: [['رولمان بلي','400-550 ج.م'],['أولسيه','150-250 ج.م']], repair: 'تغيير رولمان البلي التالف.' }
        }
    },
    'washer-semi': {
        diag: 'حوض العصر لا يدور.',
        parts: [['موتور عصر','600-800 ج.م'],['مكثف كهربائي (كابستور)','100-200 ج.م']],
        repair: '1. فحص المكثف واستبداله.\n2. استبدال موتور العصر إذا كانت ملفاته تالفة.',
        keywords: {
            'لا يدور,عصر': { diag: 'تلف المكثف أو موتور العصر.', parts: [['مكثف كهربائي','100-200 ج.م'],['موتور عصر','600-800 ج.م']], repair: 'استبدال المكثف أو الموتور.' }
        }
    },
    dryer: {
        diag: 'الهواء بارد ولا يوجد تسخين.',
        parts: [['هيتر حراري','500-700 ج.م'],['فيوز حراري','200-300 ج.م']],
        repair: '1. فحص واستبدال عنصر التسخين.\n2. فحص الفيوز الحراري.',
        keywords: {
            'بارد,لا يسخن': { diag: 'تلف عنصر التسخين.', parts: [['هيتر حراري','500-700 ج.م']], repair: 'استبدال الهيتر.' }
        }
    },
    dishwasher: {
        diag: 'الأطباق تخرج متسخة.',
        parts: [['مضخة غسيل','500-700 ج.م'],['ذراع رش','200-300 ج.م']],
        repair: '1. تسليك الرشاشات.\n2. فحص واستبدال مضخة التدوير.',
        keywords: {
            'متسخ,نظافة': { diag: 'خلل في نظام التدوير.', parts: [['مضخة غسيل','500-700 ج.م']], repair: 'تسليك الرشاشات.' }
        }
    },
    ac: {
        diag: 'ضعف في التبريد أو تساقط مياه.',
        parts: [['غاز فريون R410','500-700 ج.م'],['كابستور','200-400 ج.م'],['خرطوم صرف','50-100 ج.م']],
        repair: '1. تنظيف الفلاتر.\n2. شحن الفريون.\n3. تسليك خرطوم الصرف.',
        keywords: {
            'لا يبرد,حرارة': { diag: 'نقص فريون أو اتساخ فلاتر.', parts: [['غاز فريون','500-700 ج.م'],['فلتر','100-200 ج.م']], repair: 'تنظيف الفلاتر وشحن الفريون.' },
            'مياه,تساقط,ينقط': { diag: 'انسداد في خرطوم الصرف.', parts: [['خرطوم صرف','50-100 ج.م']], repair: 'تسليك خرطوم الصرف.' }
        }
    },
    'ac-central': {
        diag: 'ضعف تدفق الهواء.',
        parts: [['فلاتر هواء','300-500 ج.م'],['سير مروحة','200-400 ج.م']],
        repair: '1. تنظيف أو استبدال الفلاتر.\n2. فحص سير المروحة.',
        keywords: {
            'ضعف,تدفق,هواء': { diag: 'اتساخ الفلاتر أو تلف السير.', parts: [['فلاتر هواء','300-500 ج.م']], repair: 'تنظيف الفلاتر.' }
        }
    },
    'water-heater': {
        diag: 'المياه لا تسخن.',
        parts: [['هيتر','300-450 ج.م'],['ثرموستات','200-300 ج.م']],
        repair: '1. فحص عنصر التسخين.\n2. استبدال الثرموستات.',
        keywords: {
            'بارد,لا يسخن': { diag: 'تلف الهيتر أو الثرموستات.', parts: [['هيتر','300-450 ج.م']], repair: 'استبدال الهيتر.' }
        }
    },
    'water-heater-gas': {
        diag: 'السخان لا يشتعل.',
        parts: [['جلدة رداخ','50-100 ج.م'],['شاحن','150-250 ج.م']],
        repair: '1. تغيير الجلدة.\n2. استبدال البطاريات أو الشاحن.',
        keywords: {
            'لا يشتعل': { diag: 'خلل في الجلدة أو الشاحن.', parts: [['جلدة رداخ','50-100 ج.م']], repair: 'تغيير الجلدة.' }
        }
    },
    'water-cooler': {
        diag: 'ضعف التبريد أو اختلاط المياه.',
        parts: [['حنفيات مبرد','100-200 ج.م'],['ثرموستات تبريد','200-300 ج.م']],
        repair: '1. تغيير الصنابير.\n2. فحص ثرموستات التبريد.',
        keywords: {
            'ضعف,تبريد,اختلاط': { diag: 'خلل في الصنابير أو الثرموستات.', parts: [['حنفيات مبرد','100-200 ج.م']], repair: 'تغيير الصنابير.' }
        }
    },
    'water-pump': {
        diag: 'الموتور يعمل ولا يرفع مياه.',
        parts: [['مفتاح أوتوماتيك','300-500 ج.م'],['ساقية نحاس','200-400 ج.م']],
        repair: '1. فحص الأوتوماتيك.\n2. استبدال الساقية التالفة.',
        keywords: {
            'لا يرفع,مياه': { diag: 'تلف الأوتوماتيك أو الساقية.', parts: [['مفتاح أوتوماتيك','300-500 ج.م']], repair: 'تغيير الأوتوماتيك.' }
        }
    },
    oven: {
        diag: 'انسداد العيون أو انطفاء الشعلة.',
        parts: [['فونيات','50-100 ج.م'],['حساس أمان','150-250 ج.م']],
        repair: '1. تسليك الفونيات.\n2. تغيير الحساس.',
        keywords: {
            'انسداد,شعلة': { diag: 'انسداد الفونيات.', parts: [['فونيات','50-100 ج.م']], repair: 'تسليك الفونيات.' }
        }
    },
    microwave: {
        diag: 'الجهاز يعمل لكنه لا يسخن.',
        parts: [['ماجنترون','700-900 ج.م'],['فيوز ضغط عالي','50-100 ج.م']],
        repair: '1. فحص واستبدال الماجنترون.\n2. فحص فيوز الضغط العالي.',
        keywords: {
            'لا يسخن': { diag: 'تلف الماجنترون.', parts: [['ماجنترون','700-900 ج.م']], repair: 'استبدال الماجنترون.' }
        }
    },
    'cooker-hood': {
        diag: 'المروحة لا تدور أو تصدر صوتاً.',
        parts: [['مكثف','100-200 ج.م'],['جلب موتور','50-100 ج.م']],
        repair: '1. تنظيف الدهون.\n2. تغيير المكثف.',
        keywords: {
            'صوت,زنة': { diag: 'تلف المكثف أو الجلب.', parts: [['مكثف','100-200 ج.م']], repair: 'تغيير المكثف.' }
        }
    },
    blender: {
        diag: 'الشفرة لا تدور.',
        parts: [['فلانشة خلاط','50-100 ج.م'],['سكاكين','100-200 ج.م']],
        repair: '1. تغيير القارنة البلاستيكية.\n2. استبدال السكاكين.',
        keywords: {
            'لا تدور,شفرة': { diag: 'تلف الفلانشة.', parts: [['فلانشة خلاط','50-100 ج.م']], repair: 'تغيير الفلانشة.' }
        }
    },
    'coffee-maker': {
        diag: 'لا تنزل القهوة.',
        parts: [['مضخة مياه','300-500 ج.م'],['جوانات سيلكون','50-100 ج.م']],
        repair: '1. عمل دورة خل.\n2. استبدال مضخة الاهتزاز.',
        keywords: {
            'لا تنزل,قهوة': { diag: 'انسداد أو تلف المضخة.', parts: [['مضخة مياه','300-500 ج.م']], repair: 'استبدال المضخة.' }
        }
    },
    toaster: {
        diag: 'الخبز لا يثبت.',
        parts: [['ملف مغناطيسي','100-200 ج.م'],['سوستة إرجاع','50-100 ج.م']],
        repair: '1. تنظيف لوحة التحكم.\n2. تغيير الملف المغناطيسي.',
        keywords: {
            'لا يثبت,خبز': { diag: 'خلل في المغناطيس.', parts: [['ملف مغناطيسي','100-200 ج.م']], repair: 'تغيير الملف.' }
        }
    },
    'food-processor': {
        diag: 'توقف كامل عن العمل.',
        parts: [['شربون موتور','100-200 ج.م'],['مفتاح أمان','50-100 ج.م']],
        repair: '1. فحص مفاتيح الأمان.\n2. تغيير الشربون.',
        keywords: {
            'توقف,لا يعمل': { diag: 'تلف الشربون أو مفتاح الأمان.', parts: [['شربون موتور','100-200 ج.م']], repair: 'تغيير الشربون.' }
        }
    },
    juicer: {
        diag: 'اهتزاز شديد.',
        parts: [['مصفاة استانلس','200-350 ج.م'],['سكاكين بشر','100-200 ج.م']],
        repair: '1. استبدال المصفاة الدوارة.',
        keywords: {
            'اهتزاز': { diag: 'خلل في المصفاة.', parts: [['مصفاة استانلس','200-350 ج.م']], repair: 'استبدال المصفاة.' }
        }
    },
    'rice-cooker': {
        diag: 'الأرز يحترق.',
        parts: [['قلب مغناطيسي','150-250 ج.م']],
        repair: '1. استبدال الحساس المغناطيسي.',
        keywords: {
            'يحترق,أرز': { diag: 'تلف الحساس المغناطيسي.', parts: [['قلب مغناطيسي','150-250 ج.م']], repair: 'استبدال الحساس.' }
        }
    },
    'air-fryer': {
        diag: 'لوحة اللمس لا تستجيب.',
        parts: [['مروحة داخلية','200-400 ج.م'],['لوحة تحكم الكترونية','400-700 ج.م']],
        repair: '1. فحص المروحة.\n2. تغيير لوحة التحكم.',
        keywords: {
            'لمس,لا تستجيب': { diag: 'خلل في لوحة التحكم.', parts: [['لوحة تحكم الكترونية','400-700 ج.م']], repair: 'تغيير لوحة التحكم.' }
        }
    },
    'electric-oven': {
        diag: 'التايمر لا يدور.',
        parts: [['مفتاح تايمر ميكانيكي','200-350 ج.م'],['شمعات تسخين','300-500 ج.م']],
        repair: '1. استبدال مفتاح الوقت.',
        keywords: {
            'تايمر,وقت': { diag: 'تلف مفتاح الوقت.', parts: [['مفتاح تايمر ميكانيكي','200-350 ج.م']], repair: 'استبدال مفتاح الوقت.' }
        }
    },
    kettle: {
        diag: 'لا يفصل بعد الغليان.',
        parts: [['مفتاح فصل اتوماتيك','100-200 ج.م'],['قاعدة كاتل حرارية','150-250 ج.م']],
        repair: '1. تغيير مفتاح الفصل الحراري.',
        keywords: {
            'لا يفصل,غليان': { diag: 'تلف مفتاح الفصل.', parts: [['مفتاح فصل اتوماتيك','100-200 ج.م']], repair: 'تغيير المفتاح.' }
        }
    },
    tv: {
        diag: 'الشاشة سوداء أو فاصلة باور.',
        parts: [['مساطر ليد','800-1200 ج.م'],['أي سي باور','300-600 ج.م']],
        repair: '1. فحص مساطر الإضاءة.\n2. صيانة بردة الباور.',
        keywords: {
            'سوداء,صورة': { diag: 'خلل في الإضاءة الخلفية.', parts: [['مساطر ليد','800-1200 ج.م']], repair: 'استبدال مساطر الإضاءة.' },
            'فاصلة,باور': { diag: 'عطل في دائرة الباور.', parts: [['أي سي باور','300-600 ج.م'],['مكثفات','100-200 ج.م']], repair: 'صيانة بردة الباور.' }
        }
    },
    receiver: {
        diag: 'فقدان بعض الترددات.',
        parts: [['أي سي إشارة','200-400 ج.م'],['مكثفات','50-100 ج.م']],
        repair: '1. فحص دائرة الإشارة.',
        keywords: {
            'ترددات,قنوات': { diag: 'خلل في دائرة الإشارة.', parts: [['أي سي إشارة','200-400 ج.م']], repair: 'استبدال أي سي الإشارة.' }
        }
    },
    'sound-system': {
        diag: 'صوت زنة أو خشخشة.',
        parts: [['مكثفات ترشيح الصوت','100-200 ج.م'],['أي سي صوت','200-400 ج.م']],
        repair: '1. تغيير مكثفات التنعيم.',
        keywords: {
            'زنة,خشخشة': { diag: 'تلف المكثفات أو أي سي الصوت.', parts: [['مكثفات ترشيح الصوت','100-200 ج.م']], repair: 'تغيير المكثفات.' }
        }
    },
    'home-theater': {
        diag: 'عدم خروج صوت من بعض المخارج.',
        parts: [['ترانزستورات طاقة','200-400 ج.م'],['بردة مخارج الصوت','300-500 ج.م']],
        repair: '1. استبدال أيسيهات التضخيم.',
        keywords: {
            'مخارج,صوت': { diag: 'تلف الترانزستورات.', parts: [['ترانزستورات طاقة','200-400 ج.م']], repair: 'استبدال الترانزستورات.' }
        }
    },
    projector: {
        diag: 'الصورة باهتة.',
        parts: [['لمبة بروجيكتور','1000-1500 ج.م']],
        repair: '1. استبدال لمبة الإضاءة.',
        keywords: {
            'باهتة,لمبة': { diag: 'انتهاء عمر اللمبة.', parts: [['لمبة بروجيكتور','1000-1500 ج.م']], repair: 'استبدال اللمبة.' }
        }
    },
    camera: {
        diag: 'خطأ في العدسة.',
        parts: [['فلاتة عدسة','300-500 ج.م'],['تروس حركة','200-400 ج.م']],
        repair: '1. تنظيف تروس العدسة.\n2. استبدال فلاتة العدسة.',
        keywords: {
            'عدسة,خطأ,Lens': { diag: 'خلل ميكانيكي في العدسة.', parts: [['فلاتة عدسة','300-500 ج.م']], repair: 'استبدال فلاتة العدسة.' }
        }
    },
    drone: {
        diag: 'عدم توازن في الطيران.',
        parts: [['ريش مراوح','100-200 ج.م'],['موتور بروشليس','400-700 ج.م']],
        repair: '1. معايرة الحساسات.\n2. استبدال الموتور التالف.',
        keywords: {
            'توازن,طيران': { diag: 'خلل في المراوح أو الموتور.', parts: [['ريش مراوح','100-200 ج.م']], repair: 'استبدال الريش.' }
        }
    },
    'gaming-console': {
        diag: 'ارتفاع حرارة الجهاز وفصله.',
        parts: [['معجون حراري','100-200 ج.م'],['مروحة تبريد','200-400 ج.م']],
        repair: '1. تنظيف المروحة.\n2. تغيير المعجون الحراري.',
        keywords: {
            'حرارة,يفصل': { diag: 'مشكلة في التبريد.', parts: [['معجون حراري','100-200 ج.م']], repair: 'تغيير المعجون الحراري.' }
        }
    },
    laptop: {
        diag: 'البطارية لا تشحن أو تفرغ بسرعة.',
        parts: [['بطارية لابتوب','800-1500 ج.م'],['سوكيت شحن','150-300 ج.م']],
        repair: '1. استبدال البطارية.\n2. فحص سوكيت الشحن.',
        keywords: {
            'بطارية,شحن': { diag: 'تلف البطارية أو سوكيت الشحن.', parts: [['بطارية لابتوب','800-1500 ج.م']], repair: 'استبدال البطارية.' }
        }
    },
    desktop: {
        diag: 'شاشة سوداء مع صفارات.',
        parts: [['رامات','400-800 ج.م'],['باور سبلاي','500-800 ج.م']],
        repair: '1. تنظيف الرامات وإعادة تركيبها.\n2. استبدال الرامات.',
        keywords: {
            'صفارات,Beeps': { diag: 'مشكلة في الرامات أو الباور.', parts: [['رامات','400-800 ج.م']], repair: 'تنظيف أو استبدال الرامات.' }
        }
    },
    tablet: {
        diag: 'الشاشة مكسورة أو اللمس لا يستجيب.',
        parts: [['شاشة كاملة','800-1500 ج.م']],
        repair: '1. تغيير الشاشة واللمس.',
        keywords: {
            'شاشة,لمس': { diag: 'تلف الشاشة.', parts: [['شاشة كاملة','800-1500 ج.م']], repair: 'تغيير الشاشة.' }
        }
    },
    printer: {
        diag: 'حشر الورق المتكرر.',
        parts: [['بكرة سحب ورق','100-200 ج.م'],['حبارة','300-500 ج.م']],
        repair: '1. تغيير بكرة سحب الورق.',
        keywords: {
            'حشر,ورق': { diag: 'تآكل بكرة السحب.', parts: [['بكرة سحب ورق','100-200 ج.م']], repair: 'استبدال بكرة السحب.' }
        }
    },
    scanner: {
        diag: 'خطوط في الصورة الممسوحة.',
        parts: [['مسطرة مسح ضوئي','300-500 ج.م'],['كابل فلات','100-200 ج.م']],
        repair: '1. تنظيف المرآة.\n2. استبدال مسطرة الإضاءة.',
        keywords: {
            'خطوط,مسح': { diag: 'اتساخ أو تلف المسطرة.', parts: [['مسطرة مسح ضوئي','300-500 ج.م']], repair: 'تنظيف أو استبدال المسطرة.' }
        }
    },
    monitor: {
        diag: 'الشاشة تطفئ بعد ثوانٍ.',
        parts: [['مكثفات كهربائية','100-200 ج.م'],['لوحة إنفرتر','300-500 ج.م']],
        repair: '1. فحص مكثفات الباور.',
        keywords: {
            'تطفئ,ثواني': { diag: 'خلل في المكثفات أو الإنفرتر.', parts: [['مكثفات كهربائية','100-200 ج.م']], repair: 'استبدال المكثفات.' }
        }
    },
    router: {
        diag: 'الواي فاي لا يعمل.',
        parts: [['أدابتور طاقة','100-200 ج.م']],
        repair: '1. عمل سوفت وير.\n2. فحص الأدابتور.',
        keywords: {
            'واي فاي,إنترنت': { diag: 'مشكلة في الإعدادات أو الأدابتور.', parts: [['أدابتور طاقة','100-200 ج.م']], repair: 'فحص الأدابتور.' }
        }
    },
    nas: {
        diag: 'فقدان خاصية RAID.',
        parts: [['هارد NAS HDD','1500-3000 ج.م']],
        repair: '1. استبدال الهارد التالف.',
        keywords: {
            'RAID,هارد': { diag: 'تلف أحد الهاردات.', parts: [['هارد NAS HDD','1500-3000 ج.م']], repair: 'استبدال الهارد.' }
        }
    },
    vacuum: {
        diag: 'ضعف في قوة الشفط.',
        parts: [['فلاتر هيبا','100-200 ج.م'],['رولمان بلي موتور','150-300 ج.م']],
        repair: '1. تنظيف أو استبدال الفلاتر.',
        keywords: {
            'شفط,ضعف': { diag: 'انسداد الفلاتر أو تلف الموتور.', parts: [['فلاتر هيبا','100-200 ج.م']], repair: 'تنظيف الفلاتر.' }
        }
    },
    'robot-vacuum': {
        diag: 'الروبوت يدور حول نفسه.',
        parts: [['وحدة عجلة جانبية','300-500 ج.م'],['حساسات مسافة','200-400 ج.م']],
        repair: '1. تنظيف الحساسات.\n2. استبدال موتور العجلة.',
        keywords: {
            'يدور,حول نفسه': { diag: 'خلل في الحساسات أو العجلة.', parts: [['حساسات مسافة','200-400 ج.م']], repair: 'تنظيف الحساسات.' }
        }
    },
    iron: {
        diag: 'المكواة لا تفصل حرارة.',
        parts: [['ثرموستات مكواة','100-200 ج.م']],
        repair: '1. استبدال الثرموستات.',
        keywords: {
            'حرارة,لا تفصل': { diag: 'تلف الثرموستات.', parts: [['ثرموستات مكواة','100-200 ج.م']], repair: 'استبدال الثرموستات.' }
        }
    },
    'steam-iron': {
        diag: 'لا يخرج بخار.',
        parts: [['مضخة بخار صغيرة','200-400 ج.م'],['خزان مياه','100-200 ج.م']],
        repair: '1. تسليك الترسبات.\n2. استبدال المضخة.',
        keywords: {
            'بخار,لا يخرج': { diag: 'انسداد أو تلف المضخة.', parts: [['مضخة بخار صغيرة','200-400 ج.م']], repair: 'استبدال المضخة.' }
        }
    },
    fan: {
        diag: 'المروحة لا تدور إلا بالدفع.',
        parts: [['مكثف مروحة','50-100 ج.م'],['جلب نحاس','50-100 ج.م']],
        repair: '1. تغيير المكثف.\n2. تزييت الجلب.',
        keywords: {
            'لا تدور,دفع': { diag: 'تلف المكثف أو الجلب.', parts: [['مكثف مروحة','50-100 ج.م']], repair: 'تغيير المكثف.' }
        }
    },
    'ceiling-fan': {
        diag: 'تدور ببطء.',
        parts: [['مكثف مروحة سقف','100-200 ج.م']],
        repair: '1. استبدال المكثف.',
        keywords: {
            'بطء,بطيء': { diag: 'تلف المكثف.', parts: [['مكثف مروحة سقف','100-200 ج.م']], repair: 'استبدال المكثف.' }
        }
    },
    'sewing-machine': {
        diag: 'قطع الخيط أو كسر الإبرة.',
        parts: [['إبر خياطة','20-50 ج.م'],['مكوك','100-200 ج.م']],
        repair: '1. ضبط توقيت المكوك.\n2. تغيير الإبرة.',
        keywords: {
            'خيط,إبرة': { diag: 'خلل في التوقيت أو الإبرة.', parts: [['إبر خياطة','20-50 ج.م']], repair: 'تغيير الإبرة وضبط المكوك.' }
        }
    },
    heater: {
        diag: 'بعض الشمعات لا تعمل.',
        parts: [['شمعات كوارتز','100-200 ج.م'],['مفتاح أمان','50-100 ج.م']],
        repair: '1. استبدال الشمعة المحترقة.',
        keywords: {
            'شمعات,لا تعمل': { diag: 'تلف الشمعات.', parts: [['شمعات كوارتز','100-200 ج.م']], repair: 'استبدال الشمعات.' }
        }
    },
    'air-purifier': {
        diag: 'إشارة حمراء دائمة.',
        parts: [['طقم فلاتر كربون وهيبا','300-500 ج.م']],
        repair: '1. تنظيف الحساس.\n2. تغيير الفلاتر.',
        keywords: {
            'إشارة,حمراء': { diag: 'اتساخ الحساس أو الفلاتر.', parts: [['طقم فلاتر','300-500 ج.م']], repair: 'تغيير الفلاتر.' }
        }
    },
    humidifier: {
        diag: 'لا يخرج رذاذ.',
        parts: [['قرص التراسونيك','150-300 ج.م']],
        repair: '1. تغيير قرص الموجات فوق الصوتية.',
        keywords: {
            'رذاذ,لا يخرج': { diag: 'تلف قرص التراسونيك.', parts: [['قرص التراسونيك','150-300 ج.م']], repair: 'استبدال القرص.' }
        }
    },
    dslr: {
        diag: 'خطأ في الشاتر.',
        parts: [['وحدة الشاتر','1500-2500 ج.م']],
        repair: '1. تغيير وحدة الشاتر.',
        keywords: {
            'شاتر,Err': { diag: 'تلف الشاتر الميكانيكي.', parts: [['وحدة الشاتر','1500-2500 ج.م']], repair: 'استبدال الشاتر.' }
        }
    },
    mirrorless: {
        diag: 'نقاط سوداء في الصور.',
        parts: [['مسحات تنظيف السنسور','200-400 ج.م']],
        repair: '1. تنظيف السنسور.',
        keywords: {
            'نقاط,سوداء': { diag: 'اتساخ السنسور.', parts: [['مسحات تنظيف السنسور','200-400 ج.م']], repair: 'تنظيف السنسور.' }
        }
    },
    'action-cam': {
        diag: 'انتفاخ البطارية.',
        parts: [['بطارية كاميرا أكشن','300-500 ج.م']],
        repair: '1. استبدال البطارية فوراً.',
        keywords: {
            'بطارية,انتفاخ': { diag: 'تلف البطارية.', parts: [['بطارية كاميرا أكشن','300-500 ج.م']], repair: 'استبدال البطارية.' }
        }
    },
    instax: {
        diag: 'الفيلم يخرج أبيض أو أسود.',
        parts: [['بكرات سحب الفيلم','100-200 ج.م'],['بطاريات قلوية','50-100 ج.م']],
        repair: '1. فحص وحدة التعريض.',
        keywords: {
            'أبيض,أسود,فيلم': { diag: 'خلل في التعريض.', parts: [['بكرات سحب الفيلم','100-200 ج.م']], repair: 'فحص وحدة التعريض.' }
        }
    },
    lens: {
        diag: 'الفوكس التلقائي لا يعمل.',
        parts: [['فلاتة الفوكس','300-500 ج.م'],['موتور فوكس','800-1500 ج.م']],
        repair: '1. استبدال فلاتة الفوكس.',
        keywords: {
            'فوكس,AF': { diag: 'تلف فلاتة أو موتور الفوكس.', parts: [['فلاتة الفوكس','300-500 ج.م']], repair: 'استبدال فلاتة الفوكس.' }
        }
    },
    gimbal: {
        diag: 'ارتعاش في ذراع الجيمبال.',
        parts: [['موتور محوري','500-800 ج.م']],
        repair: '1. معايرة الوزن.\n2. استبدال موتور المحور.',
        keywords: {
            'ارتعاش,ذراع': { diag: 'تلف موتور المحور.', parts: [['موتور محوري','500-800 ج.م']], repair: 'استبدال الموتور.' }
        }
    },
    'ring-light': {
        diag: 'رعشة في الإضاءة.',
        parts: [['درايفر رينج لايت','100-200 ج.م'],['شريط ليد','100-200 ج.م']],
        repair: '1. استبدال الدرايفر.',
        keywords: {
            'رعشة,إضاءة': { diag: 'تلف الدرايفر أو شريط الليد.', parts: [['درايفر رينج لايت','100-200 ج.م']], repair: 'استبدال الدرايفر.' }
        }
    },
    car: {
        diag: 'السيارة لا تدور مع صوت تكتكة.',
        parts: [['بطارية سيارة','1000-1800 ج.م'],['بادئ الحركة','800-1500 ج.م']],
        repair: '1. شحن أو استبدال البطارية.\n2. فحص المارش.',
        keywords: {
            'تكتكة,لا تدور': { diag: 'ضعف البطارية أو تلف المارش.', parts: [['بطارية سيارة','1000-1800 ج.م']], repair: 'شحن أو استبدال البطارية.' },
            'سحب,وقود,تقطيع': { diag: 'مشكلة في نظام الوقود أو الإشعال.', parts: [['بوجيه','100-200 ج.م'],['فلتر بنزين','50-100 ج.م']], repair: 'تنظيف الكاربرتير وتغيير البوجيه.' }
        }
    },
    motorcycle: {
        diag: 'تقطيع في السحب.',
        parts: [['بوجيه','100-200 ج.م'],['فلتر بنزين','50-100 ج.م'],['طقم إصلاح كاربرتير','200-400 ج.م']],
        repair: '1. تنظيف الكاربرتير.\n2. تغيير البوجيه.',
        keywords: {
            'تقطيع,سحب,وقود': { diag: 'خلل في الكاربرتير أو البوجيه.', parts: [['بوجيه','100-200 ج.م']], repair: 'تغيير البوجيه.' }
        }
    },
    scooter: {
        diag: 'انزلاق في السحب.',
        parts: [['سير سكوتر','200-400 ج.م'],['سحب البلح','100-200 ج.م']],
        repair: '1. تغيير سير الحركة.',
        keywords: {
            'انزلاق,سحب': { diag: 'تآكل السير أو البلح.', parts: [['سير سكوتر','200-400 ج.م']], repair: 'تغيير السير.' }
        }
    },
    truck: {
        diag: 'ضعف الفرامل وصوت صفير.',
        parts: [['تيل فرامل','500-900 ج.م'],['خزانات فرامل','300-600 ج.م']],
        repair: '1. خرط الطنابير.\n2. تغيير تيل الفرامل.',
        keywords: {
            'فرامل,صفير': { diag: 'تآكل تيل الفرامل.', parts: [['تيل فرامل','500-900 ج.م']], repair: 'تغيير تيل الفرامل.' }
        }
    },
    bus: {
        diag: 'سخونة محرك الديزل.',
        parts: [['طلمبة مياه','500-900 ج.م'],['جوان وش سلندر','300-600 ج.م']],
        repair: '1. تسليك الردياتير.\n2. تغيير طلمبة المياه.',
        keywords: {
            'سخونة,محرك': { diag: 'خلل في نظام التبريد.', parts: [['طلمبة مياه','500-900 ج.م']], repair: 'تغيير طلمبة المياه.' }
        }
    },
    'tuk-tuk': {
        diag: 'الفتيس لا يستجيب.',
        parts: [['واير غيارات','100-200 ج.م'],['ورق دبرياج','200-400 ج.م']],
        repair: '1. تغيير واير الغيارات.',
        keywords: {
            'فتيس,غيارات': { diag: 'تلف واير الغيارات أو الدبرياج.', parts: [['واير غيارات','100-200 ج.م']], repair: 'تغيير واير الغيارات.' }
        }
    },
    bicycle: {
        diag: 'الجنزير يفلت.',
        parts: [['جنزير جديد','100-200 ج.م'],['جشمة خلفية','200-400 ج.م']],
        repair: '1. ضبط الجشمة.\n2. تغيير الجنزير.',
        keywords: {
            'جنزير,يفلت': { diag: 'ارتخاء الجنزير.', parts: [['جنزير جديد','100-200 ج.م']], repair: 'تغيير الجنزير.' }
        }
    },
    'electric-bike': {
        diag: 'العجلة تدور ببطء وتفصل.',
        parts: [['بطارية ليثيوم','2000-4000 ج.م'],['منظم سرعة','500-1000 ج.م']],
        repair: '1. اختبار خلايا البطارية.\n2. استبدال التالف.',
        keywords: {
            'بطء,بطارية': { diag: 'تلف خلايا البطارية.', parts: [['بطارية ليثيوم','2000-4000 ج.م']], repair: 'استبدال البطارية.' }
        }
    },
    generator: {
        diag: 'يعمل ولا يخرج كهرباء.',
        parts: [['كارت AVR','400-700 ج.م'],['شربون دينامو','100-200 ج.م']],
        repair: '1. تغيير منظم الجهد AVR.',
        keywords: {
            'كهرباء,فولت': { diag: 'تلف منظم الجهد.', parts: [['كارت AVR','400-700 ج.م']], repair: 'استبدال كارت AVR.' }
        }
    },
    ups: {
        diag: 'يفصل فوراً عند انقطاع الكهرباء.',
        parts: [['بطاريات جافة','300-600 ج.م']],
        repair: '1. استبدال البطاريات الداخلية.',
        keywords: {
            'يفصل,كهرباء': { diag: 'انتهاء عمر البطاريات.', parts: [['بطاريات جافة','300-600 ج.م']], repair: 'استبدال البطاريات.' }
        }
    },
    welder: {
        diag: 'تضيء لمبة الحماية ولا تلحم.',
        parts: [['ترانزستورات IGBT','500-1000 ج.م'],['مراوح تبريد','200-400 ج.م']],
        repair: '1. تغيير ترانزستورات الطاقة.',
        keywords: {
            'حماية,OC': { diag: 'تفحم ترانزستورات الطاقة.', parts: [['ترانزستورات IGBT','500-1000 ج.م']], repair: 'استبدال الترانزستورات.' }
        }
    },
    drill: {
        diag: 'شرار كثيف وضعف في الدوران.',
        parts: [['طقم شربون','50-100 ج.م'],['ظرف شنيور','200-400 ج.م']],
        repair: '1. استبدال الفرش الكربونية.',
        keywords: {
            'شرار,شربون': { diag: 'تآكل الشربون.', parts: [['طقم شربون','50-100 ج.م']], repair: 'استبدال الشربون.' }
        }
    },
    compressor: {
        diag: 'تسريب هواء مستمر.',
        parts: [['مفتاح ضغط','300-500 ج.م'],['بلف عدم رجوع','100-200 ج.م']],
        repair: '1. استبدال مفتاح الضغط.',
        keywords: {
            'تسريب,هواء': { diag: 'تلف مفتاح الضغط.', parts: [['مفتاح ضغط','300-500 ج.م']], repair: 'استبدال مفتاح الضغط.' }
        }
    },
    'solar-panel': {
        diag: 'انخفاض إنتاجية الأمبير.',
        parts: [['ديود حماية','50-100 ج.م']],
        repair: '1. تغيير ديود الحماية.',
        keywords: {
            'أمبير,إنتاجية': { diag: 'تلف ديود الحماية.', parts: [['ديود حماية','50-100 ج.م']], repair: 'استبدال الديود.' }
        }
    },
    smartphone: {
        diag: 'الهاتف لا يشحن.',
        parts: [['فلاتة شحن','150-300 ج.م'],['بطارية داخلية','300-600 ج.م']],
        repair: '1. تغيير فلاتة الشحن.\n2. استبدال البطارية.',
        keywords: {
            'لا يشحن,شحن': { diag: 'تلف فلاتة الشحن أو البطارية.', parts: [['فلاتة شحن','150-300 ج.م']], repair: 'تغيير فلاتة الشحن.' },
            'شاشة,مكسورة': { diag: 'تلف الشاشة.', parts: [['شاشة كاملة','800-1500 ج.م']], repair: 'تغيير الشاشة.' }
        }
    },
    smartwatch: {
        diag: 'الشاشة تنفصل.',
        parts: [['بطارية ساعة ذكية','200-400 ج.م'],['مادة لاصقة','50-100 ج.م']],
        repair: '1. إعادة لصق الشاشة.',
        keywords: {
            'تنفصل,شاشة': { diag: 'انتفاخ البطارية.', parts: [['بطارية ساعة ذكية','200-400 ج.م']], repair: 'استبدال البطارية.' }
        }
    },
    'smart-speaker': {
        diag: 'لا تسمع الأوامر.',
        parts: [['مصفوفة ميكروفونات','200-400 ج.م']],
        repair: '1. تغيير بردة المايكات.',
        keywords: {
            'لا تسمع,مايك': { diag: 'عطل في الميكروفونات.', parts: [['مصفوفة ميكروفونات','200-400 ج.م']], repair: 'استبدال الميكروفونات.' }
        }
    },
    'smart-lock': {
        diag: 'لا يفتح بالبصمة.',
        parts: [['موتور قفل مصغر','200-400 ج.م'],['حساس بصمة','300-500 ج.م']],
        repair: '1. تغيير موتور القفل.',
        keywords: {
            'بصمة,لا يفتح': { diag: 'تلف الموتور أو الحساس.', parts: [['موتور قفل مصغر','200-400 ج.م']], repair: 'استبدال الموتور.' }
        }
    },
    'smart-light': {
        diag: 'اللمبة تومض ولا تتصل.',
        parts: [['شريحة واي فاي مدمجة','100-200 ج.م'],['مكثفات ميكرو','50-100 ج.م']],
        repair: '1. استبدال مكثف التنعيم.',
        keywords: {
            'تومض,واي فاي': { diag: 'خلل في المكثفات.', parts: [['مكثفات ميكرو','50-100 ج.م']], repair: 'استبدال المكثفات.' }
        }
    },
    'smart-thermostat': {
        diag: 'لا يرسل إشارة تشغيل.',
        parts: [['ريليه الكتروني','100-200 ج.م']],
        repair: '1. استبدال الريليه.',
        keywords: {
            'إشارة,ريليه': { diag: 'تلف الريليه.', parts: [['ريليه الكتروني','100-200 ج.م']], repair: 'استبدال الريليه.' }
        }
    },
    other: {
        diag: 'يرجى وصف المشكلة بدقة ليتم تشخيصها بواسطة فني متخصص.',
        parts: [['فحص فني','200 ج.م'],['صيانة عامة','300 ج.م']],
        repair: 'يتم تحديد طريقة الإصلاح بعد الفحص.',
        keywords: {}
    }
};
