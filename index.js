document.getElementById('search-button').addEventListener('click', function() {
    let movieTitle = document.getElementById('user-search').value;
    document.getElementById('user-search').value = ""
    movieTitle = encodeURIComponent(movieTitle);
    searchMovies(movieTitle);
});

async function searchMovies(query) {
    const response = await fetch(`/api/movies?q=${query}`);
    const data = await response.json();
    displayResults(data.Search);
}

async function displayResults(data) {
    let html = []; // Will hold 
    for (let movieObject of data){
        html.push(await renderCard(movieObject))
        // Since renderCard is a async function so its returns a promise object we should wait for it before pushing
        // otherwise we will just push a promise object
    }
    document.getElementsByTagName("main")[0].innerHTML = html.join("")
    
}
async function fetchMovieDetails(title) {
    const response = await fetch(`/api/movie-details?t=${encodeURIComponent(title)}`);
    return response.json();
}

async function renderCard(movieObject){
    const movieDetails = await fetchMovieDetails(movieObject.Title)
    console.log(movieDetails)
    let html = `
    <div class="movie-card">
        <img class="movie-poster" src=${movieObject.Poster}>
        <div class="movie-details">
            <h3 class="movie-title">${movieDetails.Title}</h3>
            <img class="star-icon" src="/images/starIcon.png">
            <span>${movieDetails.Ratings[0].Value}</span>
            <div class="centered-align">
                <span class="extra-info">${movieDetails.Runtime}</span>
                <span class="extra-info genre">${movieDetails.Genre}</span>
                <button class="watchlist-btn"><img src="/images/addToWatchlistIcon.png"><span class="extra-info">Watchlist</span></button>
            </div>
            <p class="plot">${movieDetails.Plot}</p>
        </div>
    </div>
    <hr />
    `
    return html
}
