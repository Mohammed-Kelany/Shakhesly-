// ملف js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCFuPSkwJhA6mgPdXB13w4SJY1VQ1W_btE",
  authDomain: "shakhesly-ai.firebaseapp.com",
  databaseURL: "https://shakhesly-ai-default-rtdb.firebaseio.com",
  projectId: "shakhesly-ai",
  storageBucket: "shakhesly-ai.firebasestorage.app",
  messagingSenderId: "455452770297",
  appId: "1:455452770297:web:66694d5a20013854120728",
  measurementId: "G-RKNJX7Z05Y"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
console.log('✅ Firebase متصل');
