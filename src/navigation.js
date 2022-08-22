window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);

function navigator() {
    if (location.hash.startsWith('#language=')) {
        let id = location.hash.slice(10);
        countryPage(id);
    } else if (location.hash.startsWith('#search=')) {
        let keyword = location.hash.slice(8);
        searchPage(keyword, 1);
    } else if (location.hash.startsWith('#movie=')) {
        let id = location.hash.slice(7);
        movieDetailsPage(id);
    } else {
        homePage();
    }
}

function homePage() {
    buildHomeScreen();
}

function countryPage(id) {
    buildCountryScreen(id);
}

function movieDetailsPage(id) {
    buildMovieScreen(id);
}

function searchPage(keyword, page) {
    buildSearchScreen(keyword, page);
}