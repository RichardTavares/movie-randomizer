const apiUrl = 'https://api.themoviedb.org/3';
const apiKey = '4fa4a93dac46070532e8552d3a4c73c5';
const bearer = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmE0YTkzZGFjNDYwNzA1MzJlODU1MmQzYTRjNzNjNSIsInN1YiI6IjY1ZGE3NmI1MDViNTQ5MDE3YjE2NjMwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jhV8oBj2vm6MdiEUz4Mo5vXJpwOXjOFeELV3YylkR6E';

// Mapeamento de IDs de gênero para seus nomes correspondentes
const genreMap = {
    28: 'Ação',
    12: 'Aventura',
    14: 'Fantasia',
    16: 'Animação',
    18: 'Drama',
    27: 'Terror',
    35: 'Comédia',
    36: 'História',
    37: 'Faroeste',
    53: 'Thriller',
    80: 'Crime',
    99: 'Documentário',
    878: 'Ficção científica',
    9648: 'Mistério',
    10402: 'Música',
    10749: 'Romance',
    10751: 'Família',
    10752: 'Guerra',
    10770: 'Cinema TV',
};

function generateRandomPage() {
    return Math.floor(Math.random() * 200) + 1;
}

function showLoading() {
    Swal.fire({
        title: 'Carregando...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        backdrop: '#000',
        didOpen: () => {
            Swal.showLoading();
            Swal.disableButtons();
        }
    });
}

function hideLoading() {
    Swal.close();
}

async function fetchMovieData(url, options) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.status_message || 'Erro na requisição da API');
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function getMovie() {
    showLoading();

    const randomPage = generateRandomPage();
    const url = `${apiUrl}/movie/popular?language=pt-BR&page=${randomPage}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${bearer}`
        }
    };

    fetchMovieData(url, options)
        .then(data => {
            const eligibleMovies = data.results.filter(movie => {
                const releaseYear = parseInt(movie.release_date?.substring(0, 4));
                const isHorrorGenre = movie.genre_ids.includes(27);
                return releaseYear >= 1985 && !isHorrorGenre && movie.overview.trim() !== '';
            });

            if (eligibleMovies.length === 0) {
                hideLoading();
                console.warn('Nenhum filme elegível encontrado. Tentando novamente.');
                getMovie();
                return;
            }

            const randomMovieIndex = Math.floor(Math.random() * eligibleMovies.length);
            const randomMovie = eligibleMovies[randomMovieIndex];
            renderMovieInfo(randomMovie);
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
            hideLoading();
        });
}

function renderMovieInfo(data) {
    const movieInfo = document.getElementById('movieInfo');

    const genreNames = data.genre_ids.map(genreId => genreMap[genreId]);
    const genres = genreNames.join(', ');

    movieInfo.innerHTML = `
        <div id="movie-info" class="row align-items-center">
            <div class="col-md-12 col-lg-3">
                <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="Poster do Filme" class="img-fluid" style="max-width: 200px">
            </div>
            <div class="col-md-12 col-lg-9">
                <h3>${data.title}</h3>
                <p><strong>Ano:</strong> ${data.release_date ? data.release_date.substring(0, 4) : 'N/A'}</p>
                <p><strong>Gênero:</strong> ${genres || 'N/A'}</p>
                <p><strong>Descrição:</strong> ${data.overview}</p>
            </div>
        </div>
    `;
}

document.getElementById('findMovie').addEventListener('click', function () {
    getMovie();
});
