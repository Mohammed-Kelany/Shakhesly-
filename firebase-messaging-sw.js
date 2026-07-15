// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCFuPSkwJhA6mgPdXB13w4SJY1VQ1W_btE",
  authDomain: "shakhesly-ai.firebaseapp.com",
  databaseURL: "https://shakhesly-ai-default-rtdb.firebaseio.com",
  projectId: "shakhesly-ai",
  storageBucket: "shakhesly-ai.firebasestorage.app",
  messagingSenderId: "455452770297",
  appId: "1:455452770297:web:66694d5a20013854120728"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title || 'شخصلي AI';
  const notificationOptions = {
    body: payload.notification.body || 'لديك إشعار جديد',
    icon: 'assets/images/icon-192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
