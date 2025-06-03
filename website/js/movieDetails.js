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

// Film detaylarını HTML içinde göster
async function showMovieDetails(movie) {
    const { title, poster_path, overview, release_date, vote_average } = movie;

    // Film detaylarını güncelle
    movieDetailsContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center;">
            <img id="movie-poster" src="${IMG_PATH + poster_path}" alt="${title}" style="max-width: 300px; margin-right: 20px;">
            <div>
                <h2 id="movie-title">${title}</h2>
                <p><strong>Çıkış Tarihi:</strong> <span id="release-date">${release_date}</span></p>
                <p><strong>Puan:</strong> <span id="vote-average">${vote_average.toFixed(1)}</span></p>
                <p><strong>Genel Bakış:</strong> <span id="overview-text">${overview}</span></p>
                <div id="trailer-container" style="text-align: center; margin-top: 20px;"></div>
            </div>
        </div>
    `;

    // Film videolarını al ve göster
    const videos = await getMovieVideos(movie.id);
    if (videos.length > 0) {
        const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            const trailerContainer = document.getElementById("trailer-container");
            trailerContainer.innerHTML = `
                <h2>Fragman</h2>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" 
                title="${trailer.name}" frameborder="0" allowfullscreen></iframe>
            `;
        }
    }
}

// Sayfa yüklendiğinde detayları yükle
if (movieId) {
    getMovieDetails(movieId);
} else {
    movieDetailsContainer.innerHTML = "<p>Film bilgisi bulunamadı.</p>";
}
