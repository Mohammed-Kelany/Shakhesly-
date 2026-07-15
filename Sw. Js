/* ============================================
   شخصلي AI - Service Worker (PWA)
   ============================================ */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCFuPSkwJhA6mgPdXB13w4SJY1VQ1W_btE",
  authDomain: "shakhesly-ai.firebaseapp.com",
  projectId: "shakhesly-ai",
  storageBucket: "shakhesly-ai.firebasestorage.app",
  messagingSenderId: "455452770297",
  appId: "1:455452770297:web:66694d5a20013854120728"
});

const messaging = firebase.messaging();

const CACHE_NAME = 'shakhesly-v1';

const FILES_TO_CACHE = [
    '/',
    'index.html',
    'login.html',
    'diagnose.html',
    'dashboard-user.html',
    'dashboard-tech.html',
    'devices.html',
    'orders.html',
    'incoming-orders.html',
    'ratings.html',
    'notifications.html',
    'profile.html',
    'about.html',
    'chat.html',
    'css/style.css',
    'css/diagnose.css',
    'css/devices.css',
    'css/orders.css',
    'css/incoming-orders.css',
    'css/profile.css',
    'css/ratings.css',
    'css/notifications.css',
    'css/chat.css',
    'js/main.js',
    'js/diagnose.js',
    'js/devices.js',
    'js/orders.js',
    'js/incoming-orders.js',
    'js/profile.js',
    'js/ratings.js',
    'js/notifications.js',
    'js/chat.js',
    'assets/images/hero-devices.png',
    'assets/images/logo.png',
    'manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('✅ تم تثبيت شخصلي PWA');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(name) {
                        return name !== CACHE_NAME;
                    })
                    .map(function(name) {
                        return caches.delete(name);
                    })
            );
        })
    );
});

// استجابة للطلبات (Offline First)
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                return response;
            }
            return fetch(event.request).then(function(response) {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseToCache);
                });
                return response;
            }).catch(function() {
                return caches.match('index.html');
            });
        })
    );
}); 

 
