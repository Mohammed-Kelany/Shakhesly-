
/* ============================================
   شخصلي AI - تفاعلات صفحة الشات
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== جلب بيانات المحادثة من الرابط ==========
    const params = new URLSearchParams(window.location.search);
    const orderId = parseInt(params.get('orderId'));
    const chatWithId = parseInt(params.get('userId'));
    const chatWithName = params.get('name') || 'المستخدم';
    const chatWithType = params.get('type') || 'user';
    
    if (!orderId || !chatWithId) {
        document.getElementById('chatName').textContent = 'خطأ في تحميل المحادثة';
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // ===== إعداد واجهة الشات =====
    document.getElementById('chatName').textContent = chatWithName;
    document.getElementById('chatAvatar').textContent = chatWithType === 'tech' ? '🔧' : '👤';
    document.getElementById('orderBadge').textContent = `طلب #${orderId}`;
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // ===== زر الرجوع =====
    if (currentUser.type === 'tech') {
        document.getElementById('btnBack').href = 'incoming-orders.html';
    } else {
        document.getElementById('btnBack').href = 'orders.html';
    }
    
    // ===== تحميل الرسائل =====
    loadMessages();
    
    // ===== إرسال رسالة =====
    document.getElementById('btnSend').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    // ===== تحديث تلقائي كل 3 ثواني =====
    setInterval(loadMessages, 3000);
    
    // ===== تمرير للأسفل =====
    scrollToBottom();
});

/* ==============================
   جلب الرسائل
   ============================== */
function getMessages() {
    const params = new URLSearchParams(window.location.search);
    const orderId = parseInt(params.get('orderId'));
    const allMessages = JSON.parse(localStorage.getItem('shakhesly_messages')) || [];
    return allMessages.filter(m => m.orderId === orderId).sort((a, b) => a.id - b.id);
}

/* ==============================
   تحميل وعرض الرسائل
   ============================== */
function loadMessages() {
    const messages = getMessages();
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const container = document.getElementById('chatMessages');
    const dateHTML = `<div class="chat-date"><span id="todayDate">${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>`;
    
    if (messages.length === 0) {
        container.innerHTML = dateHTML + `
            <div class="empty-chat">
                <div class="empty-icon">💬</div>
                <p>لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
            </div>
        `;
    } else {
        container.innerHTML = dateHTML + messages.map(msg => {
            const isSent = msg.senderId === currentUser.id;
            const time = new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-bubble">
                        ${msg.text}
                        <span class="message-time">${time}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // مش عايزين نعمل سكرول تلقائي عشان متضايقش المستخدم لو بيقرأ رسايل قديمة
}

/* ==============================
   إرسال رسالة جديدة
   ============================== */
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const params = new URLSearchParams(window.location.search);
    const orderId = parseInt(params.get('orderId'));
    const chatWithId = parseInt(params.get('userId'));
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    
    const allMessages = JSON.parse(localStorage.getItem('shakhesly_messages')) || [];
    
    allMessages.push({
        id: Date.now(),
        orderId: orderId,
        senderId: currentUser.id,
        receiverId: chatWithId,
        text: text,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('shakhesly_messages', JSON.stringify(allMessages));
    
    input.value = '';
    loadMessages();
    scrollToBottom();
    
    // تركيز على الإدخال تاني
    input.focus();
}

/* ==============================
   تمرير للأسفل
   ============================== */
function scrollToBottom() {
    const container = document.getElementById('chatMessages');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
} 
