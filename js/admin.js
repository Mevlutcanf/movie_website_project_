import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut, deleteUser } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sayfa yüklendiğinde admin kontrolü ve yorumları yükleme
document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail || userEmail !== 'admin@mail.com') {
        alert('Bu sayfaya erişim yetkiniz yok!');
        window.location.href = 'login.html';
        return;
    }

    // Admin bilgisini göster ve kullanıcıları listele
    const adminEmailElement = document.getElementById('admin-email');
    if (adminEmailElement) {
        adminEmailElement.textContent = `👑 Admin: ${userEmail}`;
    }
    loadUsers();
    loadReviews(); // Yorumları yükle
});

// Kullanıcıları listeleme fonksiyonu
async function loadUsers() {
    const userList = document.getElementById('user-list');
    if (!userList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        if (querySnapshot.empty) {
            userList.innerHTML = '<p>Henüz kayıtlı kullanıcı bulunmamaktadır.</p>';
            return;
        }

        let tableHTML = `
            <table class="user-table">
                <thead>
                    <tr>
                        <th>E-posta</th>
                        <th>Kayıt Tarihi</th>
                        <th>Rol</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
        `;

        querySnapshot.forEach(doc => {
            const userData = doc.data();
            const date = userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'Belirtilmemiş';
            
            tableHTML += `
                <tr>
                    <td>${userData.email}</td>
                    <td>${date}</td>
                    <td>${userData.role || 'user'}</td>
                    <td>${userData.status || 'active'}</td>
                    <td>
                        <button onclick="deactivateUser('${doc.id}')" class="deactivate-btn">Pasif Yap</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        userList.innerHTML = tableHTML;
    } catch (error) {
        console.error('Kullanıcılar yüklenemedi:', error);
        userList.innerHTML = '<p>Kullanıcılar yüklenirken bir hata oluştu.</p>';
    }
}

// Kullanıcıyı pasif yapma fonksiyonu
window.deactivateUser = async (userId) => {
    if (confirm('Bu kullanıcıyı pasif yapmak istediğinize emin misiniz?')) {
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: 'pasif'
            });
            alert('Kullanıcı başarıyla pasif yapıldı!');
            loadUsers(); // Listeyi yenile
        } catch (error) {
            console.error('Kullanıcı pasif yapılamadı:', error);
            alert('Kullanıcı pasif yapılırken bir hata oluştu!');
        }
    }
};

// Yorumları listeleme fonksiyonu
async function loadReviews() {
    const reviewList = document.getElementById('review-list');
    if (!reviewList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        if (querySnapshot.empty) {
            reviewList.innerHTML = '<p>Henüz yorum yapılmamış.</p>';
            return;
        }

        let tableHTML = `
            <table class="review-table">
                <thead>
                    <tr>
                        <th>Kullanıcı</th>
                        <th>Film ID</th>
                        <th>Puan</th>
                        <th>Yorum</th>
                        <th>Tarih</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
        `;

        querySnapshot.forEach(doc => {
            const reviewData = doc.data();
            const date = reviewData.timestamp ? new Date(reviewData.timestamp.seconds * 1000).toLocaleDateString() : 'Belirtilmemiş';
            
            tableHTML += `
                <tr>
                    <td>${reviewData.userEmail}</td>
                    <td>${reviewData.movieId}</td>
                    <td>${reviewData.rating}</td>
                    <td>${reviewData.comment}</td>
                    <td>${date}</td>
                    <td>
                        <button onclick="deleteReview('${doc.id}')" class="delete-btn">Sil</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        reviewList.innerHTML = tableHTML;
    } catch (error) {
        console.error('Yorumlar yüklenemedi:', error);
        reviewList.innerHTML = '<p>Yorumlar yüklenirken bir hata oluştu.</p>';
    }
}

// Yorum silme fonksiyonu
window.deleteReview = async (reviewId) => {
    if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            alert('Yorum başarıyla silindi!');
            loadReviews(); // Listeyi yenile
        } catch (error) {
            console.error('Yorum silinemedi:', error);
            alert('Yorum silinirken bir hata oluştu!');
        }
    }
};

// Logo tıklama işleyicisi
window.handleLogoClick = () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        window.location.href = 'admin-panel.html';
    } else {
        window.location.href = 'guest.html';
    }
};

// Çıkış yapma işleyicisi
window.handleLogout = (event) => {
    event.preventDefault();
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        signOut(auth).then(() => {
            window.location.href = 'login.html'; // Çıkış başarılı ise login sayfasına yönlendir
        }).catch((error) => {
            console.error('Çıkış yapılırken hata:', error);
        });
    }
};

export { loadUsers };
