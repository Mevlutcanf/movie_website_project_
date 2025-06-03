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

// Sayfa Kontrol Değişkenleri
let currentPage = 1; // Mevcut sayfa
let totalPages = 0; // Toplam sayfa sayısı

// Başlangıçta popüler filmleri yükler
getMovies(API_URL, currentPage);
getRecommendedMovies(); // Önerilen filmleri yükler

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

// Filmleri ana bölüme ekleyen işlev
function showMovies(movies) {
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
        getMovies(API_URL, currentPage);
        updatePageInfo();   
    } else {
        alert("Son sayfadasınız!");
    }
});

// Önceki sayfaya geç
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        getMovies(API_URL, currentPage);
    } else {
        alert("İlk sayfadasınız!");
    }
});

// Türleri al
async function getGenres() {
    const genreSelect = document.getElementById('genre-select'); // Elemanı kontrol edin
    if (!genreSelect) {
        console.error("Tür seçim menüsü (genreSelect) bulunamadı.");
        return;
    }

    try {
        const res = await fetch(GENRES_API);
        const data = await res.json();

        if (data.genres && data.genres.length > 0) {
            data.genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreSelect.appendChild(option);
            });
        } else {
            console.error("Türler yüklenemedi.");
        }
    } catch (error) {
        console.error("Türler alınırken hata oluştu:", error);
    }
}

// Tür değişikliğini dinle
document.getElementById('genre-select').addEventListener('change', () => {
    const selectedGenre = document.getElementById('genre-select').value;
    const genreURL = selectedGenre
        ? `${API_URL}&with_genres=${selectedGenre}`
        : API_URL; // Tüm filmleri göster

    getMovies(genreURL, currentPage);
});

// Başlangıçta tüm verileri yükle
(async () => {
    await getGenres(); // Türleri al
    getMovies(API_URL, currentPage); // Filmleri yükle
    getRecommendedMovies(); // Önerilen filmleri yükle
})();
