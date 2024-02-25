const apiUrl = 'https://api.themoviedb.org/3';
const apiKey = '4fa4a93dac46070532e8552d3a4c73c5';
const bearer = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmE0YTkzZGFjNDYwNzA1MzJlODU1MmQzYTRjNzNjNSIsInN1YiI6IjY1ZGE3NmI1MDViNTQ5MDE3YjE2NjMwNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jhV8oBj2vm6MdiEUz4Mo5vXJpwOXjOFeELV3YylkR6E';

const genres = [
    { id: 28, name: 'Ação' },
    { id: 12, name: 'Aventura' },
    { id: 14, name: 'Fantasia' },
    { id: 16, name: 'Animação' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Terror' },
    { id: 35, name: 'Comédia' },
    { id: 36, name: 'História' },
    { id: 37, name: 'Faroeste' },
    { id: 53, name: 'Thriller' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentário' },
    { id: 878, name: 'Ficção Científica' },
    { id: 9648, name: 'Mistério' },
    { id: 10402, name: 'Música' },
    { id: 10749, name: 'Romance' },
    { id: 10751, name: 'Família' },
    { id: 10752, name: 'Guerra' },
    { id: 10770, name: 'Cinema TV' },
];

// function selecteGenre(callback) {
//     Swal.fire({
//         title: 'Selecione um Gênero',
//         input: 'select',
//         inputOptions: {
//             '': 'Aleatório',
//             ...Object.fromEntries(genres.map(({ id, name }) => [id, name]))
//         },
//         inputPlaceholder: 'Aleatório',
//         showCancelButton: true,
//         confirmButtonText: 'Confirmar',
//         cancelButtonText: 'Cancelar',
//         reverseButtons: true,
//         allowOutsideClick: false,
//         allowEscapeKey: false,
//         backdrop: '#000',
//     }).then((result) => {
//         if (result.isConfirmed) {
//             const selectedGenre = result.value;
//             callback(selectedGenre);
//         }
//     });
// }

function generateRandomPage() {
    return Math.floor(Math.random() * 200) + 1;
}

function showLoading() {
    Swal.fire({
        html: `<h2 class="font-kode">Carregando...</h2>`,
        color: "#fff",
        backdrop: '#000',
        background: "#000",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
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

function getMovie(selectedGenre = '') {
    showLoading();

    const randomPage = generateRandomPage();
    let url = `${apiUrl}/movie/popular?language=pt-BR&page=${randomPage}&sort_by=popularity.desc`;
    if (selectedGenre !== '') {
        url += `&with_genres=${selectedGenre}`;
    }

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${bearer}`
        }
    };

    fetchMovieData(url, options)
        .then(data => {
            let eligibleMovies = data.results.filter(movie => {
                const releaseYear = parseInt(movie.release_date?.substring(0, 4));
                const hasOverview = movie.overview.trim() !== '';
                const isHorrorGenre = movie.genre_ids.includes(27);
                return releaseYear >= 1985 && hasOverview && !isHorrorGenre;
            });

            if (eligibleMovies.length === 0) {
                hideLoading();
                console.warn('Nenhum filme elegível encontrado.');
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

    const genreNames = data.genre_ids.map(genreId => {
        const genre = genres.find(g => g.id === genreId);
        return genre ? genre.name : 'N/A';
    });
    const genresText = genreNames.join(', ');

    movieInfo.innerHTML = `
        <div id="movie-info" class="row align-items-center">
            <div class="col-md-12 col-lg-3">
                <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="Poster" class="img-fluid poster">
            </div>
            <div class="col-md-12 col-lg-9">
                <h3>${data.title}</h3>
                <p><strong>Ano:</strong> ${data.release_date ? data.release_date.substring(0, 4) : 'N/A'}</p>
                <p><strong>Gênero:</strong> ${genresText || 'N/A'}</p>
                <p><strong>Descrição:</strong> ${data.overview}</p>
            </div>
        </div>
    `;
}

document.getElementById('findMovie').addEventListener('click', function () {
    getMovie();
});
