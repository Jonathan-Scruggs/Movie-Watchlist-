const siteHeader = document.getElementsByClassName("site-header")[0]
const myWatchlistSpot = document.getElementById("my-watchlist")
const main = document.getElementsByTagName("main")[0]
const searchbar = document.getElementsByClassName("search-bar")[0]
let currentResults = [];
document.getElementById('search-button').addEventListener('click', function() {
    let movieTitle = document.getElementById('user-search').value;
    document.getElementById('user-search').value = ""
    movieTitle = encodeURIComponent(movieTitle);
    searchMovies(movieTitle);
});

document.addEventListener("click",addMovieToWatchlist)
myWatchlistSpot.addEventListener("click",render)

async function searchMovies(query) {
    const response = await fetch(`/api/movies?q=${query}`);
    const data = await response.json();
    displayResults(data.Search);
}

async function displayResults(data) {
    let html = []; // Will hold 
    let count = 0
    for (let movieObject of data){
        html.push(await renderCard(movieObject,count,"Watchlist"))
        // Since renderCard is a async function so its returns a promise object we should wait for it before pushing
        // otherwise we will just push a promise object
        count++
    }
    main.innerHTML = html.join("")
    
}
async function fetchMovieDetails(title) {
    const response = await fetch(`/api/movie-details?t=${encodeURIComponent(title)}`);
    return response.json();
}

async function renderCard(movieObject,id,buttonType){
    const movieDetails = await fetchMovieDetails(movieObject.Title)
    currentResults.push(movieDetails)
    let posOfSlash = movieDetails.Ratings[0].Value.indexOf("/")
    let movieRating = movieDetails.Ratings[0].Value.slice(0,posOfSlash)
    let buttonString = ``;
    if (buttonType === "Watchlist"){
        buttonString = `<button class="watchlist-btn" data-id="${id}"><img src="/images/addToWatchlistIcon.png"><span class="extra-info">Watchlist</span></button>`
    }
    else{
        buttonString = `<button class="watchlist-btn" data-id="${id}"><img src="/images/removeFromWishlist.png"><span class="extra-info">Remove</span></button>`
    }
    let html = `
    <div class="movie-card">
        <img class="movie-poster" src=${movieObject.Poster}>
        <div class="movie-details">
            <h3 class="movie-title">${movieDetails.Title}</h3>
            <div class="rating-div">
                <img class="star-icon" src="/images/starIcon.png">
                <span>${movieRating}</span>
            </div>
            <div class="centered-align">
                <span class="runtime extra-info">${movieDetails.Runtime}</span>
                <span class="extra-info genre">${movieDetails.Genre}</span>
                ${buttonString}
            </div>
            <p class="plot">${movieDetails.Plot}</p>
        </div>
    </div>
    <hr />
    `
    return html
}

// Function for adding to watchlist
function addMovieToWatchlist(event){
    if (event.target.dataset.id || event.target.parentElement.dataset.id){
        let id = event.target.dataset.id || event.target.parentElement.dataset.id
        id = Number(id)
        let movieToAdd = currentResults[id]
        console.log(movieToAdd)
        localStorage.setItem(`${movieToAdd.imdbID}`,JSON.stringify(movieToAdd))
    }
}

async function renderWatchlist(){
    siteHeader.textContent = "My Watchlist";
    myWatchlistSpot.textContent = "Search for movies";
    searchbar.style.display = "none";
    console.log(localStorage.length)
    if (localStorage.length === 0){
        main.innerHTML = `
        <div>
        <h3>Your watchlist is looking a little empty...</h3>
        <button id="empty-watchlist"><img src="/images/addToWatchlistIcon.png"><span>Let's add some movies!</span></button>
        </div>`

    }
    let html = []
    for (let [key,value] of Object.entries(localStorage)){
        html.push(await renderCard(JSON.parse(value),key,"Remove"))
    }
    main.innerHTML = html.join("")
    
}


function renderSearchMenu(){
    siteHeader.textContent = "Find your film";
    myWatchlistSpot.textContent = "My Watchlist";
    searchbar.style.display = "visible";
}