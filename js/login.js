import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyD_z-ElsTCTD4xdL36upqHhsM78a2dej68",
    authDomain: "moviedata-1d21c.firebaseapp.com",
    projectId: "moviedata-1d21c",
    storageBucket: "moviedata-1d21c.firebasestorage.app",
    messagingSenderId: "888397376474",
    appId: "1:888397376474:web:aae5cd9c0d68c9198f2ee3",
    measurementId: "G-XJ64Z9JTP2"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.getElementById('sign-in-form');
    
    // Eğer giriş formu varsa
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();  // Formun normal submit işlemini engelle
            
            const email = signInForm.querySelector('input[type="email"]').value;
            const password = signInForm.querySelector('input[type="password"]').value;
            
            console.log('Giriş yapılıyor:', email);  // Debug log
            
            // Firebase ile giriş işlemi
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log('Giriş başarılı!');
                    const user = userCredential.user;

                    // Giriş yapıldıktan sonra kullanıcıyı yönlendir
                    window.location.href = 'user.html';
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    // Kullanıcıya anlamlı hata mesajı göster
                    let userMessage = "Giriş yapılamadı, lütfen bilgilerinizi kontrol edin.";
                    if (errorCode === 'auth/invalid-email') {
                        userMessage = "Geçersiz e-posta adresi.";
                    } else if (errorCode === 'auth/wrong-password') {
                        userMessage = "Yanlış şifre, lütfen tekrar deneyin.";
                    } else if (errorCode === 'auth/user-not-found') {
                        userMessage = "Kullanıcı bulunamadı.";
                    }
                    
                    console.error('Giriş hatası:', errorMessage);
                    alert(userMessage);
                });
        });
    }
});

// Sayfa yüklendiğinde kullanıcının giriş yapıp yapmadığını kontrol et
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Kullanıcı giriş yapmışsa, onu 'user.html' sayfasına yönlendirebiliriz
        window.location.href = 'user.html';
    } else {
        // Kullanıcı giriş yapmamışsa, login sayfasında kalmaya devam eder
        console.log("Kullanıcı giriş yapmamış");
    }
});
