import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-config";

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI form geçişi
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const signInForm = document.querySelector('.sign-in form');
const signUpForm = document.querySelector('.sign-up form');

// Form geçişleri
registerBtn.addEventListener('click', () => container.classList.add("active"));
loginBtn.addEventListener('click', () => container.classList.remove("active"));

// Giriş yapma
if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();  // Formun varsayılan gönderimini engelle
        const email = signInForm.querySelector('input[type="email"]').value;
        const password = signInForm.querySelector('input[type="password"]').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Giriş başarılı!", user.email);
                window.location.href = 'user.html';  // Başarıyla giriş yapıldığında user.html'e yönlendir
            })
            .catch((error) => {
                console.error("Giriş başarısız:", error.message);
                alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
            });
    });
}

// Kayıt olma
if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signUpForm.querySelector('input[type="email"]').value;
        const password = signUpForm.querySelector('input[type="password"]').value;

        createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log("Kayıt başarılı!");
        return setDoc(doc(db, "users", user.uid), {
            email: user.email,
            createdAt: new Date(),
        });
    })
    .then(() => {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        container.classList.remove("active");
        window.location.href = 'user.html';
    })
    .catch((error) => {
        console.error("Kayıt başarısız:", error.message);
        alert("Kayıt başarısız! Lütfen bilgilerinizi kontrol edin.");
    });

    });
}

// Kullanıcı giriş durumu
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Kullanıcı giriş yaptı:", user.email);
    } else {
        console.log("Kullanıcı çıkış yaptı veya oturum kapalı.");
    }
});
