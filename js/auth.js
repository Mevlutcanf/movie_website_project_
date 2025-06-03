import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; 

// Firebase yapılandırması
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getFirestore(app);

// Kullanıcı kayıt fonksiyonu
export async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore'a kullanıcı bilgilerini kaydet
        // Bu satır çalıştığında "users" collection otomatik oluşturulur
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            createdAt: new Date(),
            role: 'user', // varsayılan rol
            status: 'active'
        });

        localStorage.setItem('userEmail', user.email);
        return user;
    } catch (error) {
        console.error("Kayıt hatası:", error.message);
        throw error;
    }
}

// Admin kontrol fonksiyonu
function isAdmin(email) {
    return getDoc(doc(db, "usersdata", email))
        .then(docSnap => {
            if (docSnap.exists()) {
                return docSnap.data().isAdmin;
            } else {
                throw new Error("Kullanıcı bulunamadı");
            }
        })
        .catch(error => {
            console.error("Admin kontrol hatası:", error);
            throw error;
        });
}

// Kullanıcı giriş fonksiyonu
export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('userEmail', user.email);

            return isAdmin(user.email).then((adminStatus) => {
                localStorage.setItem('isAdmin', adminStatus ? 'true' : 'false');
                if (adminStatus) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'user.html';
                }
                return userCredential.user;
            });
        })
        .catch((error) => {
            console.error("Giriş başarısız:", error.message);
            throw error;
        });
}

// Çıkış yapma fonksiyonu
export function logoutUser() {
    return signOut(auth)
        .then(() => {
            console.log("Çıkış yapıldı");
            localStorage.clear();
            window.location.href = 'guest.html'; // Misafir sayfasına yönlendir
        })
        .catch((error) => {
            console.error("Çıkış hatası:", error);
            throw error;
        });
}

// Firebase Authentication state değişim dinleyicisi güncellendi
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log('Kullanıcı oturumu kapalı');
        localStorage.clear();
        sessionStorage.clear();
        // Sadece admin-panel.html veya admin.html sayfalarındayken yönlendir
        if (window.location.pathname.includes('admin')) {
            window.location.href = 'login.html';
        }
    } else if (user.email === 'admin@mail.com') {
        localStorage.setItem('isAdmin', 'true');
        // Login sayfasındaysa admin panele yönlendir
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'admin-panel.html';
        }
    }
});
