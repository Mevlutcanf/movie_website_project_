import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Sabitler
const MOVIE_DETAILS_API = 'https://api.themoviedb.org/3/movie/';
const MOVIE_VIDEOS_API = 'https://api.themoviedb.org/3/movie/';
const API_KEY = '758736e96fed4b3f7e4bac4255067796';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

// HTML Elemanları
const movieDetailsContainer = document.getElementById("movie-details");

// URL'den film ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("id");

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
const db = getFirestore(app);

// Kullanıcı bilgilerini al ve sayfa içeriğini güncelle
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        localStorage.setItem('userEmail', user.email);
        if (movieId) {
            refreshMovieDetails(movieId);
        }
        updateUIForLoggedInUser(user);
    } else {
        currentUser = null;
        localStorage.removeItem('userEmail'); // Firebase oturumu kapandığında localStorage'ı da temizle
        if (movieId) {
            refreshMovieDetails(movieId);
        }
        updateUIForLoggedOutUser();
    }
});

// Çıkış yapma işlevi
async function logout() {
    try {
        await auth.signOut();
        localStorage.removeItem('userEmail');
        window.location.href = '../html/guest.html';
    } catch (error) {
        console.error('Çıkış yapılırken hata:', error);
    }
}

// Giriş yapmış kullanıcı için UI güncelleme
function updateUIForLoggedInUser(user) {
    const userFeatures = document.getElementById('user-features');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailSpan = document.getElementById('user-email');

    if (userFeatures) userFeatures.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) {
        logoutBtn.style.display = 'inline';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
    }
    if (userEmailSpan) userEmailSpan.textContent = `👋 Hoşgeldin, ${user.email.split('@')[0]}`;
}

// Giriş yapmamış kullanıcı için UI güncelleme
function updateUIForLoggedOutUser() {
    const userFeatures = document.getElementById('user-features');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailSpan = document.getElementById('user-email');

    if (userFeatures) userFeatures.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userEmailSpan) userEmailSpan.textContent = '';
}

// API'den film detaylarını çek
async function getMovieDetails(id) {
    try {
        const res = await fetch(`${MOVIE_DETAILS_API}${id}?api_key=${API_KEY}&language=tr-TR`);
        const movie = await res.json();
        showMovieDetails(movie);
    } catch (error) {
        console.error("Film detayları alınırken hata oluştu:", error);
        movieDetailsContainer.innerHTML = "<p>Film bilgileri yüklenemedi.</p>";
    }
}

// API'den film videolarını çek
async function getMovieVideos(id) {
    try {
        const res = await fetch(`${MOVIE_VIDEOS_API}${id}/videos?api_key=${API_KEY}&language=tr-TR`);
        const videos = await res.json();
        return videos.results;
    } catch (error) {
        console.error("Film videoları alınırken hata oluştu:", error);
        return [];
    }
}

// Değerlendirmeleri Firestore'a kaydetmek için fonksiyon
async function saveReview(review) {
    try {
        const reviewsRef = collection(db, 'reviews');
        await addDoc(reviewsRef, {
            movieId: movieId,
            userEmail: review.userEmail,
            rating: Number(review.rating),
            comment: review.comment,
            timestamp: new Date()
        });
        return true;
    } catch (error) {
        console.error('Değerlendirme kaydedilirken hata:', error);
        throw error;
    }
}

// Film detaylarını HTML içinde göster
async function showMovieDetails(movie) {
    const { title, poster_path, overview, release_date, vote_average, genres } = movie;
    const genreNames = genres.map(genre => genre.name).join(', ');

    movieDetailsContainer.innerHTML = `
        <div id="movie-content">
            <div style="display: flex; gap: 20px;">
                <img src="${IMG_PATH + poster_path}" alt="${title}" style="max-width: 300px;">
                <div>
                    <h2>${title}</h2>
                    <p><strong>Çıkış Tarihi:</strong> ${release_date}</p>
                    <p><strong>Puan:</strong> ${vote_average.toFixed(1)}</p>
                    <p><strong>Genel Bakış:</strong> ${overview}</p>
                    <p><strong>Türler:</strong> ${genreNames}</p>
                </div>
            </div>
            <div id="trailer-container" style="margin: 20px 0;"></div>
            
            <!-- Yorum bölümü -->
            <div id="reviews-section" style="margin-top: 30px;">
                <h3>Film Değerlendirmesi</h3>
                ${currentUser ? `
                    <!-- Giriş yapmış kullanıcılar için değerlendirme formu -->
                    <div id="user-features" style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
                        <div class="rating">
                            <span>Puan Ver: </span>
                            <select id="user-rating">
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5" selected>5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                            </select>
                        </div>
                        <textarea id="user-comment" placeholder="Film hakkında düşüncelerinizi yazın..." 
                            style="width: 100%; min-height: 100px; margin: 10px 0; padding: 10px;"></textarea>
                        <button onclick="submitReview()" 
                            style="background: #e9202a; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
                            Değerlendirmeyi Gönder
                        </button>
                    </div>
                ` : `
                    <!-- Giriş yapmamış kullanıcılar için mesaj -->
                    <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center;">
                        <p>Film hakkında yorum yapabilmek için <a href="login.html" style="color: #e9202a; text-decoration: none; font-weight: bold;">giriş yapın</a> veya 
                        <a href="login.html" style="color: #e9202a; text-decoration: none; font-weight: bold;">kayıt olun</a>.</p>
                    </div>
                `}
                
                <!-- Tüm değerlendirmeler bölümü -->
                <h3>Değerlendirmeler</h3>
                <div id="reviews-container"></div>
            </div>
        </div>`;

    // Trailer yükleme
    const videos = await getMovieVideos(movie.id);
    if (videos.length > 0) {
        const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            document.getElementById("trailer-container").innerHTML = `
                <h3>Fragman</h3>
                <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;">
                    <iframe 
                        src="https://www.youtube-nocookie.com/embed/${trailer.key}?modestbranding=1&rel=0"
                        title="${movie.title} - Fragman"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        loading="lazy"
                        allow="encrypted-media; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>`;
        }
    }

    // Yorumları göster
    loadReviews(movie.id);
}

// Yorumları Firestore'dan yüklemek için fonksiyon
async function loadReviews(movieId) {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('movieId', '==', movieId),
            orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });

        const container = document.getElementById('reviews-container');
        
        if (reviews.length === 0) {
            container.innerHTML = '<p>Henüz değerlendirme yapılmamış.</p>';
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="review" style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                <div class="review-header">
                    <strong>${review.userEmail}</strong>
                    <span style="color: gold;">★</span> ${review.rating}/10
                    <small style="color: #666;">${new Date(review.timestamp.seconds * 1000).toLocaleDateString()}</small>
                </div>
                <p>${review.comment}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
        document.getElementById('reviews-container').innerHTML = 
            '<p>Yorumlar yüklenirken bir hata oluştu.</p>';
    }
}

// Yorum gönderme fonksiyonu
window.submitReview = async function() {
    if (!currentUser) {
        alert('Değerlendirme yapmak için giriş yapmalısınız!');
        return;
    }

    const rating = document.getElementById('user-rating').value;
    const comment = document.getElementById('user-comment').value;

    if (!rating || !comment) {
        alert('Lütfen hem puan hem de yorum ekleyin!');
        return;
    }

    const review = {
        movieId,
        userEmail: currentUser.email,
        rating,
        comment
    };

    try {
        await saveReview(review);
        alert('Değerlendirmeniz başarıyla kaydedildi!');
        
        // Form alanlarını temizle
        document.getElementById('user-rating').value = '5';
        document.getElementById('user-comment').value = '';
        
        // Yorumları yeniden yükle
        await refreshMovieDetails(movieId);
    } catch (error) {
        console.error('Yorum kaydedilirken hata:', error);
        alert('Yorum kaydedilirken bir hata oluştu!');
    }
};

// Film detaylarını yeniden yükle ve yorumları güncelle
async function refreshMovieDetails(movieId) {
    try {
        const res = await fetch(`${MOVIE_DETAILS_API}${movieId}?api_key=${API_KEY}&language=tr-TR`);
        const movie = await res.json();
        await showMovieDetails(movie);
        await loadReviews(movieId); // Yorumları yeniden yükle
    } catch (error) {
        console.error("Film detayları güncellenirken hata oluştu:", error);
    }
}

// Sayfa yüklendiğinde detayları yükle
if (movieId) {
    getMovieDetails(movieId);
} else {
    movieDetailsContainer.innerHTML = "<p>Film bilgisi bulunamadı.</p>";
}
