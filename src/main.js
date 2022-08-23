const BASE_API_URL = 'https://api.themoviedb.org/3';
const TOP_RATED_PATH = '/movie/top_rated';
const MOVIE_DETAILS_PATH = '/movie/';
const SEARCH_PATH = '/search/movie';

// oparability functions
async function getSearchResult(keyword, page) {
    const response = await fetch(`${BASE_API_URL}${SEARCH_PATH}?api_key=${API_KEY}&query=${keyword}&page=${page}`)
    const data = await response.json()
    if(response.status !== 200) {
      console.log("Hubo un error: ", response.status, data.message);
    } else {
        return data.results;
    }
}

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
    
async function getMoviesByCountry(countries, pages) {
    let moviesFound = {};
    for(item of countries) {
        moviesFound[item] = [];
    }
    for(let i=1; i<=pages; i++) {
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
        case 'it':
            heading = 'Italia';
            break;

    }
    return heading
}

// build sections functions
async function buildHomeScreen() {
    window.scrollTo({ top: 0})
    location.hash = '#home';
    // searchInputHome.value = "";
    searchInputCountry.value = "";
    searchInputSearch.value = "";
    // hide all sections and show home
    homeSection.classList.remove("inactive");
    movieSection.classList.add("inactive");
    countrySection.classList.add("inactive");
    searchSection.classList.add("inactive");
    

    const countries = ['en', 'ja', 'ko', 'fr', 'es', 'de', 'zh', 'it'];
    const moviesLimit = 10;
    const imageBaseUrl = await getImageBaseURL(2);
    const moviesContainer = document.getElementById('home-movies-container');
    await getMoviesByCountry(countries, 51).then(obj => {
        moviesContainer.innerHTML = "";
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
                        <img data-img="${imageBaseUrl}${obj[key][i].poster_path}" alt="${obj[key][i].title}" id="${obj[key][i].id}" class="home-section--movie-poster-img">
                    </figure>
                `

                slider.innerHTML += fig;
            }
        }
    });
    const seeMoreBtn = document.querySelectorAll('.see-more-btn');
    seeMoreBtn.forEach(function(btn) {
        btn.addEventListener('click', (e) => {
            location.hash = '#language=' + e.target.id;
        });
    });
    const movies = document.querySelectorAll('.fig-movie-poster');
    movies.forEach(function(movie) {
        movie.addEventListener('click', (e) => {
            location.hash = '#movie=' + e.target.id;
        });
    });
    const imgs = document.querySelectorAll('.home-section--movie-poster-img');
    imgs.forEach(function(img) {
        lazyLoader.observe(img);
    });
}

async function buildCountryScreen(id) {
    window.scrollTo({ top: 0});
    searchInputHome.value = "";
    // searchInputCountry.value = "";
    searchInputSearch.value = "";
    // hide sections and show country
    homeSection.classList.add("inactive");
    countrySection.classList.remove("inactive");
    searchSection.classList.add("inactive");
    movieSection.classList.add("inactive");
    
    const headingSpan = document.getElementById('title--country');
    const countryMoviesContainer = document.getElementById('country-movies-container');
    countryMoviesContainer.classList.add('search-results-loading');
    headingSpan.innerText = "";
    const imageBaseUrl = await getImageBaseURL(2);
    await getMoviesByCountry([id], 100).then(obj => {
        countryMoviesContainer.classList.remove('search-results-loading');
        headingSpan.innerText = `Mejores peliculas de ${makeHeading(id)}.`;
        countryMoviesContainer.innerHTML = "";
        
        for(item of obj[id]) {
            let fig = `
            <figure class="movie-poster">
                <img data-img="${imageBaseUrl}${item.poster_path}" alt="${item.title}" id="${item.id}" class="fig-movie-poster--country">
            </figure>
            `

            countryMoviesContainer.innerHTML += fig;
        }
    });
    const movies = document.querySelectorAll('.fig-movie-poster--country');
    movies.forEach(function(movie) {
        movie.addEventListener('click', (e) => {
            location.hash = '#movie=' + e.target.id;
        });
        lazyLoader.observe(movie);
    });
}

async function buildMovieScreen(id) {
    window.scrollTo({ top: 0});
    // searchInputHome.value = "";
    // searchInputCountry.value = "";
    // searchInputSearch.value = "";
    // hide sections and show movie
    homeSection.classList.add("inactive");
    countrySection.classList.add("inactive");
    searchSection.classList.add("inactive");
    movieSection.classList.remove("inactive");

    const movieCover = document.getElementById('movie-cover-id');
    const movieCoverLoading = document.getElementById('movie-cover-loading');
    movieCoverLoading.classList.add('movie-cover-loading');
    movieCover.src = "";
    const movieVote = document.getElementById('movie-vote-average');
    movieVote.innerText = "";
    const movieOverview = document.getElementById('movie-overview');
    movieOverview.innerText = "";
    movieOverview.classList.add('movie-overview-loading');
    const movieTitle = document.getElementById('movie-original-title');
    movieTitle.innerText = "";
    const streamingContainer = document.getElementById('streaming-container');
    streamingContainer.innerHTML = "";
    const movieCastContainer = document.getElementById('movie-cast-crew-container');
    movieCastContainer.classList.add('cast-people-loading');
    let imageBaseUrl = await getImageBaseURL(3);
    await getMovieDetails(id).then(obj => {
        movieCoverLoading.classList.remove('movie-cover-loading');
        movieOverview.classList.remove('movie-overview-loading');
        movieCover.src = `${imageBaseUrl}${obj.poster_path}`;
        movieVote.innerText = obj.vote_average.toFixed(1);
        movieOverview.innerText = obj.overview;
        movieTitle.innerText = obj.title;
    });
    imageBaseUrl = await getImageBaseURL(1);
    await getMovieProviders(id).then(obj => {
        if(obj['MX'].flatrate) {
            for(item of obj['MX'].flatrate) {
                img = `
                    <img src="${imageBaseUrl}${item.logo_path}" alt="${item.provider_name}">
                `

                streamingContainer.innerHTML += img;
            }
        }
    }).catch( e => {
        streamingContainer.innerHTML = "<p>😿 Por ahora esta pelicula no está disponible en streaming.</p>"
    });
    await getMovieCastCrew(id).then(obj => {
        movieCastContainer.classList.remove('cast-people-loading');
        movieCastContainer.innerHTML = "";
        // get crew
        for(item of obj.crew) {
            let crewMember;
            switch(item.job) {
                case "Director":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="${item.name}">
                        <span>${item.name}</span>
                        <span>(${item.job})</span>
                    </figure>
                    `
                    movieCastContainer.innerHTML += crewMember;
                    break;
                case "Director of Photography":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="${item.name}">
                        <span>${item.name}</span>
                        <span>(${item.job})</span>
                    </figure>
                    `
                    movieCastContainer.innerHTML += crewMember;
                    break;
                case "Screenplay":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="${item.name}">
                        <span>${item.name}</span>
                        <span>(${item.job})</span>
                    </figure>
                    `
                    movieCastContainer.innerHTML += crewMember;
                    break;
                case "Producer":
                    crewMember = `
                    <figure class="cast-person">
                        <img src="${imageBaseUrl}${item.profile_path}" alt="${item.name}">
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
                <img src="${imageBaseUrl}${obj.cast[i].profile_path}" alt="${obj.cast[i].name}">
                <span>${obj.cast[i].name}</span>
                <span>(${obj.cast[i].character})</span>
            </figure>
            `
            movieCastContainer.innerHTML += castMember;
        }
    });
}

async function buildSearchScreen(keyword, page) {
    window.scrollTo({ top: 0});
    searchInputHome.value = "";
    searchInputCountry.value = "";
    // searchInputSearch.value = "";
    // hide sections and show movie
    homeSection.classList.add("inactive");
    countrySection.classList.add("inactive");
    searchSection.classList.remove("inactive");
    movieSection.classList.add("inactive");

    const searchResultContainer = document.getElementById('search-result-container');
    searchResultContainer.classList.add('search-results-loading');
    imageBaseUrl = await getImageBaseURL(2);
    await getSearchResult(keyword, page).then(arr => {
        searchResultContainer.classList.remove('search-results-loading');
        searchResultContainer.innerHTML = ""
        for(item of arr) {
                let fig = `
                <figure class="movie-poster">
                    <img src="${imageBaseUrl}${item.poster_path}" alt="${item.title}" id="${item.id}" class="fig-movie-poster--country">
                </figure>
                `
                searchResultContainer.innerHTML += fig;
        };
    });
    const movies = document.querySelectorAll('.fig-movie-poster--country');
    movies.forEach(function(movie) {
        movie.addEventListener('click', (e) => {
            location.hash = '#movie=' + e.target.id;
        });
        movie.addEventListener('error', () => {
            movie.setAttribute('src', errorImage)
        });
    });
}

// general elements and event listeners
const homeSection = document.getElementById('section--home');
const countrySection = document.getElementById('section--country');
const searchSection = document.getElementById('section--search');
const movieSection = document.getElementById('section--movie');

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
movieBackButton.addEventListener('click', () => {
    location.hash = window.history.back();
});

// movie home button
const movieHomeButton = document.getElementById('movie-home-btn');
movieHomeButton.addEventListener('click', () => {
    location.hash = "#home";
});

// country back button
const countryBackButton = document.getElementById('country-back-btn');
countryBackButton.addEventListener('click', () => {
    location.hash = window.history.back();
});

// country home button
const countryHomeButton = document.getElementById('country-home-btn');
countryHomeButton.addEventListener('click', () => {
    location.hash = "#home";
});

// search back button
const searchBackButton = document.getElementById('search-back-btn');
searchBackButton.addEventListener('click', () => {
    location.hash = window.history.back();
});

// search home button
const searchHomeButton = document.getElementById('search-home-btn');
searchHomeButton.addEventListener('click', () => {
    location.hash = "#home";
});

// search button and input
const searchInputHome = document.getElementById('search-input-home');
const searchInputCountry = document.getElementById('search-input-country');
const searchInputSearch = document.getElementById('search-input-search');
const searchBtn = document.querySelectorAll('.search-btn')
searchBtn.forEach(function(btn) {
    btn.addEventListener('click', (e) => {
        if(searchInputHome.value !== "") {
            location.hash = `#search=${searchInputHome.value}`;
        } else if(searchInputCountry.value !== "") {
            location.hash = `#search=${searchInputCountry.value}`;
        } else if(searchInputSearch.value !== "") {
            location.hash = `#search=${searchInputSearch.value}`;
        }
        else {
            alert('no valid search')
        }
    });
});
searchInputHome.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        location.hash = `#search=${searchInputHome.value}`;
    }
});
searchInputCountry.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        location.hash = `#search=${searchInputCountry.value}`;
    }
});
searchInputSearch.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        location.hash = `#search=${searchInputSearch.value}`;
    }
});

// lazy loading images
const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
        }
    });
});

// imagen error
const errorImage = '../assets/icons/error.svg';