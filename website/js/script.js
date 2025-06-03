// Firebase modüllerini içe aktar
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firebase yapılandırmanızı tanımlayın ve başlatın
const firebaseConfig = {
    apiKey: "AIzaSyDAs3k7O6ifEcaqp528z8s11vIQ2Ul9VbI",
    authDomain: "movie-website-2e448.firebaseapp.com",
    projectId: "movie-website-2e448",
    storageBucket: "movie-website-2e448.firebasestorage.app",
    messagingSenderId: "594383416214",
    appId: "1:594383416214:web:9f1128ad9d9819054fcbb7",
    measurementId: "G-WXRS8EJQ7E"
};

// Firebase'i başlat ve Authentication'ı al
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});
    

    // Giriş Yapma İşlemi
    const signInForm = document.querySelector('.sign-in form');
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = signInForm.querySelector('input[type="email"]').value;
            const password = signInForm.querySelector('input[type="password"]').value;

            // Firebase ile Giriş Yapma
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    console.log("Giriş başarılı!");
                    window.location.href = 'index.html'; // Başarılı girişte yönlendirme
                })
                .catch((error) => {
                    console.error("Giriş başarısız:", error.message);
                    alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
                });
        });
    }

    // Kayıt Olma İşlemi
    const signUpForm = document.querySelector('.sign-up form');
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = signUpForm.querySelector('input[type="email"]').value;
            const password = signUpForm.querySelector('input[type="password"]').value;

            // Firebase ile Kayıt Olma
            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    console.log("Kayıt başarılı!");
                    alert("Kayıt başarılı! Giriş yapabilirsiniz.");
                    container.classList.remove("active"); // Giriş yap formuna geçiş
                })
                .catch((error) => {
                    console.error("Kayıt başarısız:", error.message);
                    alert("Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.");
                });
        });
    }

