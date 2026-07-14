/* ============================================
   شخصلي AI - تفاعلات صفحة تشخيص الأعطال
   الإصدار: 6.0 (قاعدة بيانات شاملة + ذكاء اصطناعي)
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

    if (btnDiagnose) {
        btnDiagnose.addEventListener('click', function() {
            const device = document.getElementById('deviceSelect').value;
            const problem = document.getElementById('problemDesc').value.trim();
            if (!device) return alert('⚠️ الرجاء اختيار الجهاز');
            if (problem.length < 5) return alert('⚠️ الرجاء كتابة وصف المشكلة (5 أحرف على الأقل)');
            startDiagnosis(device, problem);
        });
    }

    if (btnVoice) {
        btnVoice.addEventListener('click', function() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) return alert('⚠️ المتصفح لا يدعم التسجيل الصوتي');
            const recognition = new SpeechRecognition();
            recognition.lang = 'ar-SA';
            btnVoice.innerHTML = '<i class="fas fa-microphone"></i> جاري الاستماع...';
            btnVoice.style.background = '#EF4444'; btnVoice.style.color = 'white';
            recognition.onresult = function(e) { document.getElementById('problemDesc').value = e.results[0][0].transcript; };
            recognition.onerror = function() { alert('⚠️ لم نتمكن من سماعك'); };
            recognition.onend = function() { btnVoice.innerHTML = '<i class="fas fa-microphone"></i> صوتي'; btnVoice.style.background = ''; btnVoice.style.color = ''; };
            recognition.start();
        });
    }

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
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:20px;padding:30px;width:90%;max-width:400px;text-align:center;position:relative;direction:rtl;font-family:Cairo,sans-serif;';
        modal.innerHTML = `
            <button id="closeImageOptions" style="position:absolute;top:10px;left:10px;background:#f1f5f9;border:none;width:36px;height:36px;border-radius:50%;font-size:1.5rem;cursor:pointer;">&times;</button>
            <h3 style="font-size:1.3rem;font-weight:800;margin-bottom:10px;">📷 اختر مصدر الصورة</h3>
            <p style="color:#64748B;margin-bottom:20px;">كيف تريد إضافة صورة الجهاز؟</p>
            <button id="btnOpenCamera" style="width:100%;padding:14px;background:#2563EB;color:white;border:none;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;margin-bottom:12px;">📸 فتح الكاميرا</button>
            <button id="btnOpenGallery" style="width:100%;padding:14px;background:transparent;color:#2563EB;border:2px solid #2563EB;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;">🖼️ اختيار من المعرض</button>
        `;
        overlay.appendChild(modal); document.body.appendChild(overlay); document.body.style.overflow = 'hidden';
        document.getElementById('btnOpenCamera').addEventListener('click', function() { closeImageModal(overlay); if(cameraInput){cameraInput.setAttribute('capture','environment');cameraInput.click();} });
        document.getElementById('btnOpenGallery').addEventListener('click', function() { closeImageModal(overlay); if(imageInput){imageInput.click();} });
        document.getElementById('closeImageOptions').addEventListener('click', function() { closeImageModal(overlay); });
        overlay.addEventListener('click', function(e) { if(e.target===overlay) closeImageModal(overlay); });
    }
    function closeImageModal(overlay) { if(overlay&&document.body.contains(overlay)){document.body.removeChild(overlay);} document.body.style.overflow=''; }

    if (imageInput) { imageInput.addEventListener('change', function(e) { if(e.target.files&&e.target.files[0]){displayImagePreview(e.target.files[0]);} }); }
    if (cameraInput) { cameraInput.addEventListener('change', function(e) { if(e.target.files&&e.target.files[0]){displayImagePreview(e.target.files[0]);} }); }
    function displayImagePreview(file) { if(!imagePreview||!imagePreviewContainer)return; const reader=new FileReader(); reader.onload=function(e){imagePreview.src=e.target.result;imagePreviewContainer.style.display='block';}; reader.readAsDataURL(file); }
    if (btnRemoveImage) { btnRemoveImage.addEventListener('click', function() { if(imagePreview)imagePreview.src=''; if(imagePreviewContainer)imagePreviewContainer.style.display='none'; if(imageInput)imageInput.value=''; if(cameraInput)cameraInput.value=''; }); }
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
                if (aiResult) { displayResult(aiResult); }
                else { const smartResult = getSmartDiagnosis(device, problem); displayResult(smartResult); }
            })
            .catch(() => { if (loadingOverlay) loadingOverlay.style.display = 'none'; const smartResult = getSmartDiagnosis(device, problem); displayResult(smartResult); });
    } else {
        setTimeout(() => { if (loadingOverlay) loadingOverlay.style.display = 'none'; const smartResult = getSmartDiagnosis(device, problem); displayResult(smartResult); }, 1500);
    }
}

// ========== دالة التشخيص المحلي الذكي ==========
function getSmartDiagnosis(device, problem) {
    const baseData = data[device] || data['other'];
    const problemLower = problem.toLowerCase();
    let specificDiag = '', specificParts = [];
    
    if (problemLower.includes('لا يبرد')||problemLower.includes('لا تبرد')||problemLower.includes('سخن')||problemLower.includes('حرارة')||problemLower.includes('تبريد')) {
        specificDiag = baseData.diag || 'مشكلة في نظام التبريد. قد يكون السبب: نقص غاز الفريون، اتساخ المكثف، أو خلل في الثرموستات.';
        specificParts = baseData.parts || [['غاز فريون','400-650 ج.م'],['ثرموستات','250-450 ج.م'],['تنظيف مكثف','150-300 ج.م']];
    } else if (problemLower.includes('صوت')||problemLower.includes('ضجيج')||problemLower.includes('اهتزاز')||problemLower.includes('صرير')) {
        specificDiag = baseData.diag || 'وجود أصوات غير طبيعية تشير إلى تآكل في الأجزاء الميكانيكية.';
        specificParts = baseData.parts || [['رولمان بلي','400-550 ج.م'],['سير','150-250 ج.م'],['فحص ميكانيكي','200-400 ج.م']];
    } else if (problemLower.includes('تسرب')||problemLower.includes('مياه')||problemLower.includes('ينقط')||problemLower.includes('تسريب')) {
        specificDiag = baseData.diag || 'تسرب المياه يشير إلى تلف في الوصلات أو الخراطيم.';
        specificParts = baseData.parts || [['خرطوم','100-200 ج.م'],['طلمبة تصريف','400-500 ج.م'],['جلدة/وصلات','50-150 ج.م']];
    } else if (problemLower.includes('لا يعمل')||problemLower.includes('مش شغال')||problemLower.includes('لا تشتغل')||problemLower.includes('لا تدور')||problemLower.includes('فصل')||problemLower.includes('لا يستجيب')) {
        specificDiag = baseData.diag || 'الجهاز لا يستجيب. الأسباب المحتملة: عطل في مصدر الطاقة، فيوز محروق، أو خلل في لوحة التحكم.';
        specificParts = baseData.parts || [['فيوز','50-100 ج.م'],['كابل طاقة','100-250 ج.م'],['كارت تحكم','500-1500 ج.م']];
    } else if (problemLower.includes('رائحة')||problemLower.includes('دخان')||problemLower.includes('شورت')||problemLower.includes('حرق')||problemLower.includes('شرارة')) {
        specificDiag = '⚠️ تحذير: وجود دخان أو رائحة حرق يشير إلى تماس كهربائي. يرجى فصل الجهاز فوراً عن الكهرباء.';
        specificParts = [['فحص كهربائي عاجل','300-500 ج.م'],['أسلاك وتوصيلات','100-300 ج.م'],['موتور','500-2000 ج.م']];
    } else if (problemLower.includes('شاشة')||problemLower.includes('صورة')||problemLower.includes('سواد')||problemLower.includes('الشاشة')) {
        specificDiag = baseData.diag || 'مشكلة في الشاشة أو العرض. الأسباب: عطل في الباكلايت، تلف كابل الشاشة، أو خلل في كارت الشاشة.';
        specificParts = baseData.parts || [['شاشة/بانل','800-2000 ج.م'],['كابل شاشة','100-300 ج.م'],['باكلايت','400-1000 ج.م']];
    } else if (problemLower.includes('بطارية')||problemLower.includes('شحن')||problemLower.includes('بطاريته')) {
        specificDiag = baseData.diag || 'مشكلة في البطارية أو نظام الشحن.';
        specificParts = baseData.parts || [['بطارية جديدة','400-2000 ج.م'],['شاحن','200-500 ج.م'],['بورت شحن','150-300 ج.م']];
    } else {
        specificDiag = baseData.diag || 'يرجى وصف المشكلة بدقة ليتم تشخيصها بواسطة فني متخصص.';
        specificParts = baseData.parts || [['فحص فني','200 ج.م'],['صيانة عامة','300 ج.م']];
    }
    return { diagnosis: specificDiag, parts: specificParts, videos: [problem] };
}

// ========== دالة التواصل مع OpenAI ==========
async function getAIDiagnosis(device, problem, apiKey) {
    const deviceSelect = document.getElementById('deviceSelect');
    const deviceName = deviceSelect ? deviceSelect.selectedOptions[0].text : 'الجهاز';
    const prompt = `أنت فني صيانة خبير. مستخدم يبلغ عن مشكلة: "${problem}" في جهاز: "${deviceName}". قم بتحليل المشكلة وأعطني النتيجة بتنسيق JSON فقط: {"diagnosis":"تشخيص دقيق للمشكلة وأسبابها المحتملة بالعربية","parts":[["اسم القطعة","السعر بالجنيه المصري"],...],"videos":["عنوان فيديو للبحث على يوتيوب",...]}`;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
            body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:prompt}],temperature:0.7,max_tokens:500})
        });
        const responseData = await response.json();
        if(responseData.choices&&responseData.choices[0]){const content=responseData.choices[0].message.content;const jsonMatch=content.match(/\{[\s\S]*\}/);if(jsonMatch){return JSON.parse(jsonMatch[0]);}}
        return null;
    } catch(error) { console.error('خطأ OpenAI:', error); return null; }
}

// ========== دالة عرض النتيجة ==========
function displayResult(result) {
    const resultEmpty = document.getElementById('resultEmpty');
    const resultContent = document.getElementById('resultContent');
    if(resultEmpty) resultEmpty.style.display = 'none';
    if(resultContent) resultContent.style.display = 'block';
    const diagnosisText = document.getElementById('diagnosisText');
    if(diagnosisText) diagnosisText.textContent = result.diagnosis || 'لم يتم تحديد التشخيص';
    const partsList = document.getElementById('partsList');
    if(partsList) {
        if(result.parts&&result.parts.length>0) { partsList.innerHTML = result.parts.map(p => `<div class="part-item"><span>${p[0]}</span><span class="price">${p[1]}</span></div>`).join(''); }
        else { partsList.innerHTML = '<p>لا توجد قطع غيار مقترحة</p>'; }
    }
    // فيديوهات يوتيوب
    const videosGrid = document.getElementById('videosGrid');
    if(videosGrid) {
        const deviceSelect = document.getElementById('deviceSelect');
        const deviceName = deviceSelect?.selectedOptions[0]?.text || '';
        const userProblem = document.getElementById('problemDesc')?.value?.trim();
        if(deviceName&&userProblem) {
            const searchQuery = encodeURIComponent(deviceName + ' ' + userProblem + ' تصليح');
            const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
            videosGrid.innerHTML = `<a href="${youtubeUrl}" target="_blank" rel="noopener" class="video-card" style="text-decoration:none;display:block;"><div class="placeholder" style="background:#FF0000;color:white;display:flex;align-items:center;justify-content:center;height:100px;border-radius:10px;font-size:2rem;">▶️</div><span style="display:block;padding:8px;font-size:0.8rem;font-weight:600;text-align:center;">🔍 ${deviceName}: ${userProblem.substring(0,30)}...</span></a><a href="${youtubeUrl}" target="_blank" rel="noopener" class="video-card" style="text-decoration:none;display:block;"><div class="placeholder" style="background:#FF0000;color:white;display:flex;align-items:center;justify-content:center;height:100px;border-radius:10px;font-size:2rem;">▶️</div><span style="display:block;padding:8px;font-size:0.85rem;font-weight:600;text-align:center;">🎬 فيديو آخر عن ${deviceName}</span></a>`;
        } else if(userProblem) {
            const searchQuery = encodeURIComponent(userProblem + ' تصليح');
            const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
            videosGrid.innerHTML = `<a href="${youtubeUrl}" target="_blank" rel="noopener" class="video-card" style="text-decoration:none;display:block;"><div class="placeholder" style="background:#FF0000;color:white;display:flex;align-items:center;justify-content:center;height:100px;border-radius:10px;font-size:2rem;">▶️</div><span style="display:block;padding:8px;font-size:0.85rem;font-weight:600;text-align:center;">🔍 "${userProblem}"</span></a>`;
        } else { videosGrid.innerHTML = '<p>لا توجد فيديوهات مقترحة</p>'; }
    }
    const techList = document.getElementById('techList');
    if(techList) { techList.innerHTML = `<div class="tech-card"><div class="tech-avatar">👨‍🔧</div><div class="tech-info"><strong>أحمد للصيانة</strong><span>⭐ 4.8 | 📍 2.5 كم</span></div><button class="btn btn-primary btn-sm">طلب</button></div><div class="tech-card"><div class="tech-avatar">👨‍💼</div><div class="tech-info"><strong>مركز النخبة</strong><span>⭐ 4.6 | 📍 4.1 كم</span></div><button class="btn btn-primary btn-sm">طلب</button></div>`; }
    const deviceSelect2 = document.getElementById('deviceSelect');
    const problemDesc = document.getElementById('problemDesc');
    if(deviceSelect2&&problemDesc) { addRequestButton(deviceSelect2.value, problemDesc.value.trim()); }
    if(result.diagnosis) { addSpeakButton(result.diagnosis); }
    if(resultContent) { resultContent.scrollIntoView({ behavior: 'smooth' }); }
}

// ========== دالة زر الصوت ==========
function addSpeakButton(text) {
    const diagnosisBox = document.querySelector('.diagnosis-box');
    if(!diagnosisBox) return;
    const oldBtn = document.getElementById('speakBtn'); if(oldBtn) oldBtn.remove();
    const speakBtn = document.createElement('button'); speakBtn.id = 'speakBtn'; speakBtn.className = 'btn btn-outline btn-sm'; speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> استمع للتشخيص'; speakBtn.style.marginTop = '10px';
    speakBtn.addEventListener('click', () => {
        if('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'ar-SA'; utterance.rate = 0.9;
            const voices = window.speechSynthesis.getVoices();
            const maleVoice = voices.find(voice => voice.lang.includes('ar') && (voice.name.includes('Male')||voice.name.includes('ذكر')||voice.name.includes('Maged')||voice.name.includes('Tarik')||voice.name.includes('Youssef')||voice.name.includes('Ali')));
            if(maleVoice) utterance.voice = maleVoice;
            else { const arabicVoice = voices.find(voice => voice.lang.includes('ar')); if(arabicVoice) utterance.voice = arabicVoice; }
            window.speechSynthesis.speak(utterance);
            speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> 🔊 جاري القراءة...';
            utterance.onend = () => { speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> استمع للتشخيص'; };
        } else { alert('المتصفح لا يدعم القراءة الصوتية'); }
    });
    diagnosisBox.appendChild(speakBtn);
}

// ========== دالة زر طلب الصيانة ==========
function addRequestButton(device, problem) {
    const requestSection = document.getElementById('requestSection'); if(!requestSection) return;
    requestSection.innerHTML = `<button class="btn btn-primary btn-block" id="btnRequestService" style="margin-top:15px;padding:16px;font-size:1.1rem;">📋 طلب صيانة من الفنيين</button>`;
    const requestBtn = document.getElementById('btnRequestService');
    if(requestBtn) { requestBtn.addEventListener('click', function() { createServiceRequest(device, problem); }); }
}

// ========== دالة إنشاء طلب الصيانة (Firebase) ==========
function createServiceRequest(device, problem) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if(!currentUser) { alert('⚠️ الرجاء تسجيل الدخول أولاً'); window.location.href = 'login.html'; return; }
    const selectEl = document.getElementById('deviceSelect');
    const deviceName = selectEl ? selectEl.options[selectEl.selectedIndex].text : 'جهاز';
    const deviceType = selectEl ? selectEl.value : 'other';
    const newOrder = { userId: currentUser.id, customerName: currentUser.fullName, deviceType, deviceName, problem, status:'pending', bids:[], selectedTechId:null, techName:null, price:null, location: currentUser.location||'غير محدد', rated:false, createdAt: firebase.database.ServerValue.TIMESTAMP };
    db.ref('orders').push(newOrder).then(() => { alert('✅ تم إرسال طلب الصيانة للفنيين!\nستظهر العروض في صفحة "طلباتي" قريباً.'); window.location.href = 'orders.html'; }).catch(err => { console.error('خطأ:', err); alert('❌ حدث خطأ. حاول مرة أخرى.'); });
}

// ============================================
// قاعدة بيانات الأعطال الشاملة (78 جهاز)
// ============================================
const data = {
    fridge: { diag: 'ضعف في التبريد مع دوران الموتور. قد يكون السبب: نقص غاز الفريون أو تسريب في الدائرة.', parts: [['غاز فريون (R134a/R600a)','400-650 ج.م'],['فلتر مجفف','150-250 ج.م'],['ثرموستات','250-450 ج.م']] },
    freezer: { diag: 'الموتور يعمل باستمرار دون توقف. قد يكون السبب: خلل في منظم الحرارة أو تلف جوان الباب.', parts: [['ثرموستات','350-450 ج.م'],['جوان باب جديد','200-400 ج.م']] },
    washer: { diag: 'الغسالة لا تطرد المياه أو تصدر صوتاً عالياً أثناء العصر.', parts: [['طلمبة طرد مياه','450-550 ج.م'],['رولمان بلي','400-550 ج.م'],['أولسيه (مانع تسريب)','150-250 ج.م'],['مساعدين','300-500 ج.م']] },
    'washer-semi': { diag: 'حوض العصر لا يدور. قد يكون السبب: تلف المكثف أو موتور العصر.', parts: [['موتور عصر','600-800 ج.م'],['مكثف كهربائي (كابستور)','100-200 ج.م'],['مفتاح تايمر','200-300 ج.م']] },
    dryer: { diag: 'لا يوجد تسخين والهواء بارد. قد يكون السبب: تلف عنصر التسخين أو الفيوز الحراري.', parts: [['هيتر حراري','500-700 ج.م'],['فيوز حراري (Thermostat)','200-300 ج.م'],['سير','200-300 ج.م']] },
    dishwasher: { diag: 'الأطباق تخرج متسخة أو الرشاشات لا تدور.', parts: [['مضخة غسيل (موتور التدوير)','500-700 ج.م'],['فلاتر','100-200 ج.م'],['ذراع رش','200-300 ج.م']] },
    ac: { diag: 'تساقط مياه من الوحدة الداخلية أو الوحدة الخارجية لا تعمل.', parts: [['خرطوم صرف','50-100 ج.م'],['عازل مواسير','100-200 ج.م'],['كابستور (Capacitor)','200-400 ج.م'],['غاز فريون R410','500-700 ج.م']] },
    'ac-central': { diag: 'ضعف تدفق الهواء في الغرف. قد يكون السبب: اتساخ الفلاتر أو تلف سير المروحة.', parts: [['فلاتر هواء','300-500 ج.م'],['سير المروحة (V-Belt)','200-400 ج.م']] },
    'water-heater': { diag: 'المياه لا تسخن. قد يكون السبب: تلف عنصر التسخين.', parts: [['هيتر','300-450 ج.م'],['ثرموستات حراري','200-300 ج.م']] },
    'water-heater-gas': { diag: 'السخان لا يشتعل عند فتح المياه. قد يكون السبب: تلف الجلدة أو الشاحن.', parts: [['جلدة رداخ','50-100 ج.م'],['شاحن (بديل البطارية)','150-250 ج.م'],['جلدة سويتش','50-100 ج.م']] },
    'water-cooler': { diag: 'اختلاط الماء الساخن بالبارد أو ضعف التبريد.', parts: [['حنفيات مبرد','100-200 ج.م'],['ثرموستات تبريد','200-300 ج.م']] },
    'water-pump': { diag: 'الموتور يعمل ولا يرفع مياه أو يدور دون توقف.', parts: [['مفتاح أوتوماتيك (فلوماك)','300-500 ج.م'],['ساقية نحاس','200-400 ج.م'],['أولسيه','100-200 ج.م']] },
    oven: { diag: 'انسداد العيون أو انطفاء الشعلة فجأة.', parts: [['فونيات','50-100 ج.م'],['حساس أمان (ثرموكوبل)','150-250 ج.م']] },
    microwave: { diag: 'الجهاز يعمل ويدور ولكنه لا يسخن.', parts: [['ماجنترون (Magnetron)','700-900 ج.م'],['فيوز ضغط عالي','50-100 ج.م'],['ديود','50-100 ج.م']] },
    'cooker-hood': { diag: 'صوت زنة والمروحة لا تدور.', parts: [['مكثف (كابستور)','100-200 ج.م'],['جلب موتور','50-100 ج.م']] },
    blender: { diag: 'الشفرة لا تدور رغم سماع صوت الموتور.', parts: [['فلانشة خلاط (القارنة البلاستيكية)','50-100 ج.م'],['سكاكين','100-200 ج.م']] },
    'coffee-maker': { diag: 'انسداد مجرى المياه وعدم نزول القهوة.', parts: [['مضخة مياه (Ulka pump)','300-500 ج.م'],['جوانات سيلكون','50-100 ج.م']] },
    toaster: { diag: 'الخبز لا يثبت بأسفل ولا يلتصق المغناطيس.', parts: [['ملف مغناطيسي','100-200 ج.م'],['سوستة إرجاع','50-100 ج.م']] },
    'food-processor': { diag: 'توقف كامل عن العمل (موتور قاطع).', parts: [['شربون موتور (فرش كربونية)','100-200 ج.م'],['مفتاح أمان (Microswitch)','50-100 ج.م']] },
    juicer: { diag: 'اهتزاز شديد أثناء العصر.', parts: [['مصفاة استانلس','200-350 ج.م'],['سكاكين بشر','100-200 ج.م']] },
    'rice-cooker': { diag: 'الأرز يحترق أو يفصل السخان مبكراً.', parts: [['قلب مغناطيسي (Thermostat السيراميكي)','150-250 ج.م']] },
    'air-fryer': { diag: 'لوحة اللمس لا تستجيب أو المروحة متوقفة.', parts: [['مروحة داخلية','200-400 ج.م'],['لوحة تحكم الكترونية','400-700 ج.م']] },
    'electric-oven': { diag: 'التايمر لا يدور تلقائياً ويتوقف الفرن.', parts: [['مفتاح تايمر ميكانيكي','200-350 ج.م'],['شمعات تسخين','300-500 ج.م']] },
    kettle: { diag: 'الكاتل لا يفصل بعد غليان الماء.', parts: [['مفتاح فصل اتوماتيك','100-200 ج.م'],['قاعدة كاتل حرارية','150-250 ج.م']] },
    tv: { diag: 'الشاشة سوداء (صوت بدون صورة) أو فاصلة باور تماماً.', parts: [['مساطر ليد (LED Backlight)','800-1200 ج.م'],['مكثفات','100-300 ج.م'],['أي سي باور (Power IC)','300-600 ج.م']] },
    receiver: { diag: 'فقدان بعض الترددات (تظهر قنوات وقنوات لا).', parts: [['أي سي إشارة (Signal IC)','200-400 ج.م'],['مكثفات 1000/16v','50-100 ج.م']] },
    'sound-system': { diag: 'صوت زنة مستمر أو خشخشة.', parts: [['مكثفات ترشيح الصوت','100-200 ج.م'],['أي سي صوت (TDA)','200-400 ج.م']] },
    'home-theater': { diag: 'عدم خروج صوت من مخارج معينة (Surround).', parts: [['ترانزستورات طاقة','200-400 ج.م'],['بردة مخارج الصوت','300-500 ج.م']] },
    projector: { diag: 'الصورة باهتة جداً أو لمبة التحذير تضيء.', parts: [['لمبة بروجيكتور (Projector Lamp)','1000-1500 ج.م']] },
    camera: { diag: 'العدسة لا تخرج أو تفتح (Lens Error).', parts: [['فلاتة عدسة','300-500 ج.م'],['تروس حركة','200-400 ج.م']] },
    drone: { diag: 'عدم توازن الطائرة أثناء الطيران أو سقوطها.', parts: [['ريش مراوح (Props)','100-200 ج.م'],['موتور بروشليس (Brushless Motor)','400-700 ج.م']] },
    'gaming-console': { diag: 'الجهاز ترتفع حرارته ويفصل (الضوء الأحمر/الأزرق).', parts: [['معجون حراري (Thermal Paste)','100-200 ج.م'],['مروحة تبريد داخلية','200-400 ج.م']] },
    laptop: { diag: 'الجهاز يعمل فقط عند توصيل الشاحن (البطارية 0%).', parts: [['بطارية لابتوب','800-1500 ج.م'],['سوكيت شحن (DC Jack)','150-300 ج.م']] },
    desktop: { diag: 'تظهر شاشة سوداء مع إصدار صفارات (Beeps).', parts: [['رامات (RAM)','400-800 ج.م'],['باور سبلاي (Power Supply)','500-800 ج.م']] },
    tablet: { diag: 'الشاشة مكسورة أو اللمس لا يستجيب.', parts: [['شاشة كاملة (LCD + Touch)','800-1500 ج.م']] },
    printer: { diag: 'حشر الورق المتكرر.', parts: [['بكرة سحب ورق (Pickup Roller)','100-200 ج.م'],['حبارة (Toner)','300-500 ج.م']] },
    scanner: { diag: 'تظهر خطوط بيضاء أو سوداء بالطول في المسح.', parts: [['مسطرة مسح ضوئي','300-500 ج.م'],['كابل فلات السير','100-200 ج.م']] },
    monitor: { diag: 'الشاشة تطفئ بعد ثوانٍ من تشغيلها.', parts: [['مكثفات كهربائية','100-200 ج.م'],['لوحة إنفرتر','300-500 ج.م']] },
    router: { diag: 'لمبة الواي فاي فاصلة أو يرسل شبكة بدون إنترنت.', parts: [['شحن فلاشة (Firmware ROM)','100-200 ج.م'],['أدابتور طاقة (12V)','100-200 ج.م']] },
    nas: { diag: 'تلف أحد الهاردات وفقدان خاصية الـ RAID.', parts: [['هارد ديسك مخصص للسيرفرات (NAS HDD)','1500-3000 ج.م']] },
    vacuum: { diag: 'ضعف شديد في قوة الشفط وصوت مرتفع.', parts: [['كيس غبار','50-100 ج.م'],['فلاتر هيبا (HEPA)','100-200 ج.م'],['رولمان بلي موتور','150-300 ج.م']] },
    'robot-vacuum': { diag: 'الروبوت يدور حول نفسه أو يعطي خطأ في الحساسات.', parts: [['وحدة عجلة جانبية','300-500 ج.م'],['حساسات مسافة (Bumpers)','200-400 ج.م']] },
    iron: { diag: 'المكواة تلتصق بالملابس ولا تفصل حرارة.', parts: [['ثرموستات مكواة','100-200 ج.م']] },
    'steam-iron': { diag: 'عدم خروج بخار رغم سخونة الجهاز.', parts: [['مضخة بخار صغيرة','200-400 ج.م'],['خزان مياه','100-200 ج.م']] },
    fan: { diag: 'المروحة تصدر زنة وتحتاج دفعاً باليد لتدور.', parts: [['مكثف مروحة (1.5-2.5 ميكروفراد)','50-100 ج.م'],['جلب نحاس','50-100 ج.م'],['عمود موتور','100-200 ج.م']] },
    'ceiling-fan': { diag: 'المروحة تدور ببطء شديد في جميع السرعات.', parts: [['مكثف مروحة سقف','100-200 ج.م']] },
    'sewing-machine': { diag: 'قطع الخيط المستمر أو كسر الإبرة.', parts: [['إبر خياطة','20-50 ج.م'],['مكوك (كروشيه)','100-200 ج.م'],['سير ماكينة','50-100 ج.م']] },
    heater: { diag: 'شمعة أو أكثر لا تضيء.', parts: [['لاندات/شمعات كوارتز أو هالوجين','100-200 ج.م'],['مفتاح أمان السقوط','50-100 ج.م']] },
    'air-purifier': { diag: 'تظهر إشارة حمراء دائمًا لجودة الهواء السيئة.', parts: [['طقم فلاتر كربون وهيبا','300-500 ج.م']] },
    humidifier: { diag: 'لا يخرج رذاذ مياه.', parts: [['قرص التراسونيك (Ultrasonic Transducer)','150-300 ج.م']] },
    dslr: { diag: 'خطأ في الشاتر (Err) وعدم التقاط الصورة.', parts: [['وحدة الشاتر (Shutter Mechanism)','1500-2500 ج.م']] },
    mirrorless: { diag: 'ظهور نقاط سوداء ثابتة في كل الصور.', parts: [['سائل ومسحات تنظيف السنسور (Sensor Swabs)','200-400 ج.م']] },
    'action-cam': { diag: 'انتفاخ البطارية وصعوبة إخراجها.', parts: [['بطارية كاميرا أكشن','300-500 ج.م']] },
    instax: { diag: 'الفيلم يخرج أبيض أو أسود بالكامل دون صورة.', parts: [['بكرات سحب الفيلم','100-200 ج.م'],['بطاريات قلوية عالية الجودة','50-100 ج.م']] },
    lens: { diag: 'الفوكس التلقائي لا يعمل (AF Error).', parts: [['فلاتة الفوكس (Flex Cable)','300-500 ج.م'],['موتور فوكس (USM/STM)','800-1500 ج.م']] },
    gimbal: { diag: 'ارتعاش ذراع الجيمبال وعدم قدرته على حمل الكاميرا.', parts: [['موتور محوري (Brushless Axis Motor)','500-800 ج.م']] },
    'ring-light': { diag: 'رعشة في الإضاءة أو انطفاء جزء من الدائرة.', parts: [['درايفر رينج لايت (Led Driver)','100-200 ج.م'],['شريط ليد','100-200 ج.م']] },
    car: { diag: 'السيارة لا تدور وتصدر صوت "تكتكة" عند التشغيل.', parts: [['بطارية سيارة','1000-1800 ج.م'],['بادئ الحركة (مارش/Starter)','800-1500 ج.م']] },
    motorcycle: { diag: 'تقطيع في السحب واستهلاك عالي للوقود.', parts: [['بوجيه (شمعة احتراق)','100-200 ج.م'],['فلتر بنزين','50-100 ج.م'],['طقم إصلاح كاربرتير','200-400 ج.م']] },
    scooter: { diag: 'انزلاق في السحب (الموتور صوته يعلو والسرعة لا تزيد).', parts: [['سير سكوتر (Drive Belt)','200-400 ج.م'],['سحب البلح (Rollers)','100-200 ج.م']] },
    truck: { diag: 'ضعف الفرامل (المكابح) وصوت صفير حاد.', parts: [['تيل فرامل هيدروليكي/هوائي','500-900 ج.م'],['خزانات فرامل','300-600 ج.م']] },
    bus: { diag: 'سخونة محرك الديزل المستمرة.', parts: [['طلمبة مياه','500-900 ج.م'],['ثرموستات كوع','200-400 ج.م'],['جوان وش سلندر','300-600 ج.م']] },
    'tuk-tuk': { diag: 'انقطاع حركة الغيارات (الفتيس لا يستجيب).', parts: [['واير غيارات','100-200 ج.م'],['ورق دبرياج','200-400 ج.م']] },
    bicycle: { diag: 'الجنزير يفلت باستمرار عند النقل.', parts: [['جنزير جديد','100-200 ج.م'],['جشمة خلفية (Derailleur)','200-400 ج.م']] },
    'electric-bike': { diag: 'العجلة تدور ببطء وتفصل بسرعة تحت الحمل.', parts: [['بطارية ليثيوم أيون (36V/48V)','2000-4000 ج.م'],['منظم سرعة (Controller)','500-1000 ج.م']] },
    generator: { diag: 'المولد يعمل ولكن لا يخرج كهرباء (0 فولت).', parts: [['كارت AVR','400-700 ج.م'],['شربون دينامو','100-200 ج.م']] },
    ups: { diag: 'عند انقطاع الكهرباء يفصل الـ UPS فوراً.', parts: [['بطاريات جافة (Lead Acid 12V/7Ah أو 9Ah)','300-600 ج.م']] },
    welder: { diag: 'تضيء لمبة الحماية الحرارية (OC) ولا تلحم.', parts: [['ترانزستورات (IGBT / Mosfet)','500-1000 ج.م'],['مراوح تبريد عالية السرعة','200-400 ج.م']] },
    drill: { diag: 'خروج شرار كثيف من الموتور مع ضعف الدوران.', parts: [['طقم شربون','50-100 ج.م'],['ظرف شنيور (Chuck)','200-400 ج.م']] },
    compressor: { diag: 'تسريب هواء مستمر من محبس الأمان أو المفتاح.', parts: [['مفتاح ضغط (Pressure Switch)','300-500 ج.م'],['بلف عدم رجوع','100-200 ج.م']] },
    'solar-panel': { diag: 'انخفاض شديد في إنتاجية الأمبير للوح واحد.', parts: [['ديود حماية (Bypass Diode)','50-100 ج.م']] },
    smartphone: { diag: 'الهاتف لا يشحن أو الشحن وهمي.', parts: [['فلاتة شحن (Charging Port Sheet)','150-300 ج.م'],['بطارية داخلية','300-600 ج.م']] },
    smartwatch: { diag: 'الشاشة تنفصل عن جسم الساعة.', parts: [['بطارية ساعة ذكية','200-400 ج.م'],['مادة لاصقة (B7000)','50-100 ج.م']] },
    'smart-speaker': { diag: 'السماعة لا تسمع الأوامر الصوتية (عطل مايك).', parts: [['مصفوفة ميكروفونات (Microphone Array Board)','200-400 ج.م']] },
    'smart-lock': { diag: 'القفل لا يفتح بالبصمة أو الكارت.', parts: [['موتور قفل مصغر (Micro Actuator Motor)','200-400 ج.م'],['حساس بصمة','300-500 ج.م']] },
    'smart-light': { diag: 'اللمبة تومض (ترعش) ولا تتصل بالواي فاي.', parts: [['شريحة واي فاي مدمجة','100-200 ج.م'],['مكثفات ميكرو','50-100 ج.م']] },
    'smart-thermostat': { diag: 'عدم إرسال إشارة تشغيل للتكييف/الدفايات.', parts: [['ريليه الكتروني (Relay 24V/12V)','100-200 ج.م']] },
    other: { diag: 'يرجى وصف المشكلة بدقة ليتم تشخيصها بواسطة فني متخصص.', parts: [['فحص فني','200 ج.م'],['صيانة عامة','300 ج.م']] }
};
