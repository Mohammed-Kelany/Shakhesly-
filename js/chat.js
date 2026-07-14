// ========== المحادثة - Firebase ==========
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    const chatWithId = params.get('userId');
    const chatWithName = params.get('name') || 'المستخدم';
    const chatWithType = params.get('type') || 'user';

    if (!orderId || !chatWithId) {
        document.getElementById('chatName').textContent = 'خطأ في تحميل المحادثة';
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    document.getElementById('chatName').textContent = chatWithName;
    document.getElementById('chatAvatar').textContent = chatWithType === 'tech' ? '🔧' : '👤';
    document.getElementById('orderBadge').textContent = `طلب #${orderId}`;
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (currentUser.type === 'tech') {
        document.getElementById('btnBack').href = 'incoming-orders.html';
    } else {
        document.getElementById('btnBack').href = 'orders.html';
    }

    loadMessages(orderId);

    document.getElementById('btnSend').addEventListener('click', () => sendMessage(orderId, chatWithId, currentUser));
    document.getElementById('messageInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage(orderId, chatWithId, currentUser);
    });

    // تحديث تلقائي كل 3 ثوانٍ
    setInterval(() => loadMessages(orderId), 3000);
});

function loadMessages(orderId) {
    db.ref('messages')
        .orderByChild('orderId')
        .equalTo(orderId)
        .once('value')
        .then(snapshot => {
            const messages = [];
            snapshot.forEach(child => {
                messages.push({ id: child.key, ...child.val() });
            });
            messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            renderMessages(messages);
        });
}

function renderMessages(messages) {
    const currentUser = JSON.parse(localStorage.getItem('shakhesly_current_user'));
    const container = document.getElementById('chatMessages');
    const dateHTML = `<div class="chat-date"><span>${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>`;

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
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
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
}

function sendMessage(orderId, receiverId, currentUser) {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;

    db.ref('messages').push({
        orderId: orderId,
        senderId: currentUser.id,
        receiverId: receiverId,
        text: text,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        input.value = '';
        loadMessages(orderId);
        input.focus();
    });
}
