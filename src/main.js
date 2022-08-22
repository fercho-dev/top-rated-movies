const BASE_API_URL = 'https://api.themoviedb.org/3';
const TOP_RATED_PATH = '/movie/top_rated';
const MOVIE_DETAILS_PATH = '/movie/';

// oparability functions

async function getImageBaseURL(size) {
    const response = await fetch(`${BASE_API_URL}/configuration?api_key=${API_KEY}`)
    const data = await response.json()
    if(response.status !== 200) {
      console.log("Hubo un error: ", response.status, data.message);
    } else {
        return `${data.images.base_url}${data.images.poster_sizes[size]}`;
    }
}

// the api has 500 pages
async function getMovies(page) {
    const response = await fetch(`${BASE_API_URL}${TOP_RATED_PATH}?api_key=${API_KEY}&page=${page}`)
    const data = await response.json()
    if(response.status !== 200) {
      console.log("Hubo un error: ", response.status, data.message);
    } else {
        return data.results;
    }
}

async function getMovieDetails(id) {
    const response = await fetch(`${BASE_API_URL}${MOVIE_DETAILS_PATH}${id}?api_key=${API_KEY}&language=es`)
    const data = await response.json()
    if(response.status !== 200) {
        console.log("Hubo un error: ", response.status, data.message);
    } else {
        return data;
    }
}

async function getMovieProviders(id) {
    const response = await fetch(`${BASE_API_URL}${MOVIE_DETAILS_PATH}${id}/watch/providers?api_key=${API_KEY}&language=es`)
    const data = await response.json()
    if(response.status !== 200) {
        console.log("Hubo un error: ", response.status, data.message);
    } else {
        return data.results;
    }
}

async function getMovieCastCrew(id) {
    const response = await fetch(`${BASE_API_URL}${MOVIE_DETAILS_PATH}${id}/credits?api_key=${API_KEY}`)
    const data = await response.json()
    if(response.status !== 200) {
        console.log("Hubo un error: ", response.status, data.message);
    } else {
        return data;
    }
}
    
async function getMoviesByCountry(countries) {
    let moviesFound = {};
    for(item of countries) {
        moviesFound[item] = [];
    }
    for(let i=1; i<=500; i++) {
        await getMovies(i).then( arr => {
            for(item of arr) {
                if(countries.includes(item.original_language)) {
                    moviesFound[item.original_language].push(item);
                }
            }
        });
    }
    return moviesFound;
}

function makeHeading(languageCode) {
    let heading;
    switch(languageCode) {
        case 'en':
            heading = 'Estados Unidos';
            break;
        case 'es':
            heading = 'España | México';
            break;
        case 'fr':
            heading = 'Francia';
            break;
        case 'ja':
            heading = 'Japon';
            break;
        case 'de':
            heading = 'Alemania';
            break;
        case 'zh':
            heading = 'China';
            break;
        case 'ko':
            heading = 'Corea';
            break;

    }
    return heading
}

// build sections functions
async function buildHomeScreen() {
    window.scrollTo({ top: 0})
    // hide all sections and show home
    const homeSection = document.getElementById('section--home');
    homeSection.classList.remove("inactive");
    const movieSection = document.getElementById('section--movie');
    movieSection.classList.add("inactive");
    const countrySection = document.getElementById('section--country');
    countrySection.classList.add("inactive");
    const searchSection = document.getElementById('section--search');
    searchSection.classList.add("inactive");
    const moviesContainer = document.getElementById('home-movies-container');
    moviesContainer.innerHTML = "";

    const countries = ['en', 'ja', 'ko', 'fr', 'es', 'de', 'zh'];
    const moviesLimit = 10;
    const imageBaseUrl = await getImageBaseURL(2);
    await getMoviesByCountry(countries).then(obj => {
        for(key in obj) {
            let moviesRow = `
                <div class="section_div--movies-row">
                    <div class="movies-row--heading">
                        <span class="movies-row--country">${makeHeading(key)}</span>
                        <span class="movies-row--btn see-more-btn" id="${key}">Ver más</span>
                    </div>
                    <div class="movies--slider" id="movies-slider-${key}">
                    </div>
                </div>
            `

            moviesContainer.innerHTML += moviesRow;

            let slider = document.getElementById(`movies-slider-${key}`);
            for(let i=0; i<moviesLimit; i++) {
                let fig = `
                    <figure class="fig-movie-poster">
                        <img src="${imageBaseUrl}${obj[key][i].poster_path}" alt="movie poster" id="${obj[key][i].id}">
                    </figure>
                `

                slider.innerHTML += fig;
            }
        }
    })
    const seeMoreBtn = document.querySelectorAll('.see-more-btn');
    seeMoreBtn.forEach(function(btn) {
        btn.addEventListener('click', buildCountryScreen);
    })
    const movies = document.querySelectorAll('.fig-movie-poster');
    movies.forEach(function(movie) {
        movie.addEventListener('click', buildMovieScreen);
    })
}

async function buildCountryScreen(e) {
    window.scrollTo({ top: 0});
    // hide sections and show country
    const homeSection = document.getElementById('section--home');
    homeSection.classList.add("inactive");
    const countrySection = document.getElementById('section--country');
    countrySection.classList.remove("inactive");
    const searchSection = document.getElementById('section--search');
    searchSection.classList.add("inactive");
    const movieSection = document.getElementById('section--movie');
    movieSection.classList.add("inactive");
    
    const moviesLimit = 10;
    const headingSpan = document.getElementById('title--country');
    const countryMoviesContainer = document.getElementById('country-movies-container');
    headingSpan.innerText = "";
    countryMoviesContainer.innerHTML = "";
    const imageBaseUrl = await getImageBaseURL(2);
    await getMoviesByCountry([e.target.id]).then(obj => {
        headingSpan.innerText = `Mejores peliculas de ${makeHeading(e.target.id)}.`;
        
        for(let i=0; i<moviesLimit; i++) {
            let fig = `
            <figure class="movie-poster fig-movie-poster--country">
                <img src="${imageBaseUrl}${obj[e.target.id][i].poster_path}" alt="movie poster" id="${obj[e.target.id][i].id}">
            </figure>
            `

            countryMoviesContainer.innerHTML += fig;
        }
    });
    const movies = document.querySelectorAll('.fig-movie-poster--country');
    movies.forEach(function(movie) {
        movie.addEventListener('click', buildMovieScreen);
    });
}

async function buildMovieScreen(e) {
    window.scrollTo({ top: 0});
    // hide sections and show movie
    const homeSection = document.getElementById('section--home');
    homeSection.classList.add("inactive");
    const countrySection = document.getElementById('section--country');
    countrySection.classList.add("inactive");
    const searchSection = document.getElementById('section--search');
    searchSection.classList.add("inactive");
    const movieSection = document.getElementById('section--movie');
    movieSection.classList.remove("inactive");

    const movieCover = document.getElementById('movie-cover-id');
    const movieVote = document.getElementById('movie-vote-average');
    const movieOverview = document.getElementById('movie-overview');
    const movieTitle = document.getElementById('movie-original-title');
    let imageBaseUrl = await getImageBaseURL(3);
    await getMovieDetails(e.target.id).then(obj => {
        movieCover.src = `${imageBaseUrl}${obj.poster_path}`;
        movieVote.innerText = obj.vote_average.toFixed(1);
        movieOverview.innerText = obj.overview;
        movieTitle.innerText = obj.title;
    });
    imageBaseUrl = await getImageBaseURL(1);
    const streamingContainer = document.getElementById('streaming-container');
    await getMovieProviders(e.target.id).then(obj => {
        if(obj['MX'].flatrate) {
            streamingContainer.innerHTML = "";
            for(item of obj['MX'].flatrate) {
                img = `
                    <img src="${imageBaseUrl}${item.logo_path}" alt="plataforma logo">
                `

                streamingContainer.innerHTML += img;
            }
        }
    }).catch( e => {
        streamingContainer.innerHTML = "<p>😿 Por ahora esta pelicula no está disponible en streaming.</p>"
    });
    const movieCastContainer = document.getElementById('movie-cast-crew-container');
    await getMovieCastCrew(e.target.id).then(obj => {
        movieCastContainer.innerHTML = "";
        // get crew
        for(item of obj.crew) {
            let crewMember;
            switch(item.job) {
                case "Director":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="profile-picture">
                        <span>${item.name}</span>
                        <span>(${item.job})</span>
                    </figure>
                    `
                    movieCastContainer.innerHTML += crewMember;
                    break;
                case "Director of Photography":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="profile-picture">
                        <span>${item.name}</span>
                        <span>(${item.job})</span>
                    </figure>
                    `
                    movieCastContainer.innerHTML += crewMember;
                    break;
                case "Screenplay":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="profile-picture">
                        <span>${item.name}</span>
                        <span>(${item.job})</span>
                    </figure>
                    `
                    movieCastContainer.innerHTML += crewMember;
                    break;
                case "Producer":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="profile-picture">
                        <span>${item.name}</span>
                        <span>(${item.job})</span>
                    </figure>
                    `
                    movieCastContainer.innerHTML += crewMember;
                    break;
                default:
                    break;
            }
        }

        // first 5 people in cast
        for(let i=0; i<10; i++) {
            let castMember = `
            <figure class="cast-person">
                <img src="${imageBaseUrl}${obj.cast[i].profile_path}" alt="profile-picture">
                <span>${obj.cast[i].name}</span>
                <span>(${obj.cast[i].character})</span>
            </figure>
            `
            movieCastContainer.innerHTML += castMember;
        }
    });
}

// initializa app

function startPage() {
    // general elements and event listeners

    // movie overview
    const movieOverview = document.getElementById('movie-overview');
    let countClicksMovieOverview = 0;
    movieOverview.addEventListener('click', (e) => {
        countClicksMovieOverview += 1;
        if(countClicksMovieOverview % 2 === 0) {
            movieOverview.style.webkitLineClamp = 3;
        } else {
            movieOverview.style.webkitLineClamp = 'unset';
        }
    })

    // movie back button
    const movieBackButton = document.getElementById('movie-back-btn');
    movieBackButton.addEventListener('click', buildHomeScreen);
    
    // country back button
    const countryBackButton = document.getElementById('country-back-btn');
    countryBackButton.addEventListener('click', buildHomeScreen);

    // create home screen
    buildHomeScreen();
}

startPage();