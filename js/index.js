// API URL'leri ve Sabitler
const API_URL = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=true&language=tr-TR&sort_by=popularity.desc&api_key=758736e96fed4b3f7e4bac4255067796';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=758736e96fed4b3f7e4bac4255067796&language=tr-TR&query=';
const RECOMMENDED_API = 'https://api.themoviedb.org/3/movie/top_rated?language=tr-TR&page=1&api_key=758736e96fed4b3f7e4bac4255067796';
const GENRES_API = 'https://api.themoviedb.org/3/genre/movie/list?api_key=758736e96fed4b3f7e4bac4255067796&language=tr-TR';

// HTML Elemanları
const form = document.getElementById('form');
const search = document.getElementById('search');
const main = document.getElementById('main');
const recommendedMoviesContainer = document.getElementById('recommended-list');
const genreList = document.getElementById('genre-list');

// Sayfa Kontrol Değişkenleri
let currentPage = 1; // Mevcut sayfa
let totalPages = 100; // Toplam sayfa sayısı
let selectedGenre = ''; // Seçilen tür

// Sayfa yüklendikten sonra fonksiyonları çalıştır
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('form');
    const main = document.getElementById('main');
    const recommendedMoviesContainer = document.getElementById('recommended-list');
    const genreList = document.getElementById('genre-list');

    // Form event listener'ı sadece form varsa ekle
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const searchTerm = search.value.trim();

            if (searchTerm) {
                getMovies(SEARCH_API + searchTerm);
                search.value = "";
            } else {
                window.location.reload();
            }
        });
    }

    // Sadece gerekli elementler varsa fonksiyonları çağır
    if (main && genreList) {
        getGenres();
        getMovies(API_URL, currentPage);
    }

    if (recommendedMoviesContainer) {
        getRecommendedMovies();
    }
});

// API'den veri alıp filmleri gösteren işlev
async function getMovies(url, page = 1) {
    try {
        const res = await fetch(`${url}&page=${page}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const filteredMovies = data.results.filter(movie => {
                const adultContent = movie.adult;
                const titleCheck = movie.title.toLowerCase().includes('xxx') || 
                                   movie.title.toLowerCase().includes('adult') || 
                                   movie.title.toLowerCase().includes('sex') || 
                                   movie.title.toLowerCase().includes('porn');
                                   
                const overviewCheck = movie.overview && (
                    movie.overview.toLowerCase().includes('xxx') || 
                    movie.overview.toLowerCase().includes('adult') || 
                    movie.overview.toLowerCase().includes('sex') || 
                    movie.overview.toLowerCase().includes('porn')
                );

                return !adultContent && !titleCheck && !overviewCheck;
            });

            showMovies(filteredMovies);
            totalPages = data.total_pages;
            updatePageInfo();
        } else {
            main.innerHTML = "<p>Filmler yüklenemedi. Lütfen tekrar deneyin.</p>";
        }
    } catch (error) {
        console.error("Filmler alınırken hata oluştu:", error);
        main.innerHTML = "<p>Bir hata oluştu. Lütfen bağlantınızı kontrol edin.</p>";
    }
}

// Arama formunu dinler ve arama sorgusunu işler
if (form) {  // form varsa event listener ekle
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const searchTerm = search.value.trim();

        if (searchTerm) {
            getMovies(SEARCH_API + searchTerm);
            search.value = "";
        } else {
            window.location.reload();
        }
    });
}

// Filmleri ana bölüme ekleyen işlev
function showMovies(movies) {
    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = "";

    movies.forEach((movie) => {
        const { title, poster_path, overview, vote_average, id } = movie;
        const roundedVote = vote_average ? vote_average.toFixed(1) : "N/A";
        const poster = poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/200x300?text=No+Image';

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        movieEl.innerHTML = `
            <img src="${poster}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${roundedVote}</span>
            </div>
            <div class="overview">
                <h3>Genel Bakış</h3>
                <p>${overview || "Açıklama bulunmuyor."}</p>
            </div>
        `;

        movieEl.addEventListener("click", () => {
            window.location.href = `movie-details.html?id=${id}`;
        });

        main.appendChild(movieEl);
    });
}

// Oy oranına göre renk sınıfı döndüren işlev
function getClassByRate(vote) {
    if (!vote) return 'gray';
    if (vote >= 8) return 'green';
    if (vote >= 5) return 'orange';
    return 'red';
}

// Önerilen filmleri almak için fonksiyon
async function getRecommendedMovies() {
    try {
        const res = await fetch(RECOMMENDED_API);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            displayRecommendedMovies(data.results);
        } else {
            recommendedMoviesContainer.innerHTML = "<p>Önerilen film bulunamadı.</p>";
        }
    } catch (error) {
        console.error("Önerilen filmler alınırken hata oluştu:", error);
        recommendedMoviesContainer.innerHTML = "<p>Öneriler yüklenirken bir hata oluştu.</p>";
    }
}

// Önerilen filmleri görüntüleme işlevi
function displayRecommendedMovies(movies) {
    recommendedMoviesContainer.innerHTML = "";

    movies.forEach(movie => {
        const { title, poster_path, id } = movie;
        const poster = poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/50x75?text=No+Image';

        const movieEl = document.createElement('div');
        movieEl.classList.add('recommended-movie');
        movieEl.innerHTML = `
            <img src="${poster}" alt="${title}" />
            <h4>${title}</h4>
        `;

        movieEl.addEventListener("click", () => {
            window.location.href = `movie-details.html?id=${id}`;
        });

        recommendedMoviesContainer.appendChild(movieEl);
    });
}

// Sayfa bilgilerini güncelleme
function updatePageInfo() {
    document.getElementById('current-page').textContent = `Sayfa: ${currentPage}`;
}

// Sonraki sayfaya geç
document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        const url = selectedGenre
            ? `${API_URL}&with_genres=${selectedGenre}`
            : API_URL;
        getMovies(url, currentPage);
        updatePageInfo();   
    } else {
        alert("Son sayfadasınız!");
    }
});

// Önceki sayfaya geç
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        const url = selectedGenre
            ? `${API_URL}&with_genres=${selectedGenre}`
            : API_URL;
        getMovies(url, currentPage);
    } else {
        alert("İlk sayfadasınız!");
    }
});

// Türleri al
async function getGenres() {
    const genreList = document.getElementById('genre-list');
    if (!genreList) return;

    try {
        const res = await fetch(GENRES_API);
        const data = await res.json();

        if (data.genres && data.genres.length > 0) {
            // Önce "Tüm Filmler" seçeneğini ekleyelim
            genreList.innerHTML = `<li><a href="#" class="active" data-genre-id="">Tüm Filmler</a></li>`;
            
            // Sonra diğer türleri ekleyelim
            data.genres.forEach(genre => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" data-genre-id="${genre.id}">${genre.name}</a>`;
                genreList.appendChild(li);
            });

            // Tür linklerine tıklama olayını ekleyelim
            const genreLinks = genreList.querySelectorAll('a');
            genreLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Aktif sınıfını yönet
                    genreLinks.forEach(l => l.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    selectedGenre = e.target.dataset.genreId;
                    currentPage = 1; // Sayfa sayısını sıfırla
                    
                    const url = selectedGenre
                        ? `${API_URL}&with_genres=${selectedGenre}`
                        : API_URL;
                    
                    getMovies(url, currentPage);
                });
            });
        } else {
            genreList.innerHTML = "<li>Türler yüklenemedi.</li>";
        }
    } catch (error) {
        console.error("Türler alınırken hata oluştu:", error);
        if (genreList) {
            genreList.innerHTML = "<li>Türler yüklenirken bir hata oluştu.</li>";
        }
    }
}