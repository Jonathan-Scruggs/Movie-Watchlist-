const siteHeader = document.getElementsByClassName("site-header")[0]
const myWatchlistSpot = document.getElementsByClassName("my-watchlist")[0]
const main = document.getElementsByTagName("main")[0]
const searchbar = document.getElementsByClassName("search-bar")[0]
let currentResults = [];

document.addEventListener("click",handleClicks)

function handleClicks(event){
    if (event.target.id === "search-button"){
        let movieTitle = document.getElementById('user-search').value;
        document.getElementById('user-search').value = ""
        movieTitle = encodeURIComponent(movieTitle);
        searchMovies(movieTitle);
    }
    else if (event.target.dataset.id || event.target.parentElement.dataset.id){
        let id = event.target.dataset.id || event.target.parentElement.dataset.id
        id = Number(id)
        addMovieToWatchlist(id)
    }
    else if (event.target.id === "my-watchlist") {
        renderWatchlist()
    }
    else if (event.target.id === "search-for-movies"){
        renderSearchMenu()
    }
    else if (event.target.id === "empty-watchlist-btn" || event.target.parentElement.id === "empty-watchlist-btn"){
        renderSearchMenu()
    }
    else if (event.target.dataset.readmore){
        renderReadMorePlot(event.target.dataset.readmore)

    }


}
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
async function renderCard(movieObject,id,buttonType){
    const movieDetails = await fetchMovieDetails(movieObject.imdbID)
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

    let needsShorten = needsViewMore(movieDetails.Plot)
    let plotString;
    if (needsShorten){
        plotString = addViewMore(movieDetails.Plot,id)
    }
    else {
        plotString = `<p class="plot">${movieDetails.Plot}</p>`
    } 

    let html = `
    <div class="movie-card default">
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
            ${plotString}
        </div>
    </div>
    <hr />
    `
    return html
}
async function fetchMovieDetails(id) {
    const response = await fetch(`/api/movie-details?i=${encodeURIComponent(id)}`);
    return response.json();
}


// WatchList Stuff
function addMovieToWatchlist(id){
    let movieToAdd = currentResults[id]
    localStorage.setItem(`${movieToAdd.imdbID}`,JSON.stringify(movieToAdd))
    
}

async function renderWatchlist(){
    siteHeader.textContent = "My Watchlist";
    myWatchlistSpot.textContent = "Search for movies";
    myWatchlistSpot.id = "search-for-movies"
    searchbar.style.display = "none";
    if (localStorage.length === 0){
        main.innerHTML = `
        <div class="empty-watchlist-div">
        <h3 class="empty-watchlist">Your watchlist is looking a little empty...</h3>
        <button id="empty-watchlist-btn" class="watchlist-btn"><img class="empty-watchlist-img" src="/images/addToWatchlistIcon.png"><span class="empty-watchlist-text">Let's add some movies!</span></button>
        </div>`
        return // To cancel the rest of function execution
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
    myWatchlistSpot.id = "my-watchlist"
    searchbar.style.display = "flex";
    main.innerHTML = ` <img src="images/no-data-initial.png" id="no-data-initial-img">`
}

function needsViewMore(text){

    if (text.length > 132){
        return true
    }
    else {
        return false
    }

}
function addViewMore(text,id){
    let shortenedPlot = text.slice(0,132)
    return `<p class="plot">${shortenedPlot}...<button data-readmore="${id}" class="read-more-btn">Read more</button></p>`
}
function renderReadMorePlot(id){
    if (Number(id)){
        id = Number(id)
        document.getElementsByClassName("movie-card")[id].classList.remove("default");
        console.log(currentResults[id])
        const fullPlot = currentResults[id].Plot;
        document.getElementsByClassName("plot")[id].textContent = fullPlot;
    }
    else {
        console.log(id)
        const movieObject = localStorage.getItem(id)
        const fullPlot = movieObject.Plot
        console.log(fullPlot)
    }
}