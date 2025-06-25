const apiKey = "eed08b06";
const genres = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "Film-Noir", "History", "Horror", "Music", "Musical",
    "Mystery", "Romance", "Sci-Fi", "Short", "Sport", "Superhero", "Thriller", "War", "Western"
];

const input = document.querySelector(".searchInput");
const results = document.querySelector(".resultats");
const submit = document.querySelector(".searchBtn");
const favoritesBtn = document.querySelector(".favBtn");
const filtersMenu = document.querySelector(".filters-menu");


genres.forEach(genre => {
    const genreBtn = document.createElement("button");
    genreBtn.textContent = genre;
    genreBtn.classList.add("genreBtn");
    filtersMenu.appendChild(genreBtn);

    genreBtn.addEventListener("click", () => filterByGenre(genre));
});


submit.addEventListener("click", () => {
    results.innerHTML = "";

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${input.value}`)
        .then(res => res.json())
        .then(data => {
            if (data.Search) {
                displayMovies(data.Search);
            } else {
                results.innerHTML = "<p>Aucun film trouvé.</p>";
            }
        })
        .catch(error => console.error("Erreur API :", error));
});

favoritesBtn.addEventListener("click", () => {
    results.innerHTML = "";
    const favs = JSON.parse(localStorage.getItem("favs")) || [];

    if (favs.length > 0) {
        displayMovies(favs);
    } else {
        results.innerHTML = "<p>Aucun favori pour le moment.</p>";
    }
});


function displayMovies(movies) {
    results.innerHTML = "";
    movies.forEach(movie => {
        const container = document.createElement("div");
        container.classList.add("movie-card");

        const title = document.createElement("h2");
        title.textContent = movie.Title;

        const image = document.createElement("img");
        image.src = movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"; 

        const year = document.createElement("h3");
        year.textContent = movie.Year;

        const favBtn = document.createElement("button");
        favBtn.textContent = isMovieInFavs(movie) ? "Supprimer des favoris" : "Ajouter aux favoris";

        favBtn.addEventListener("click", () => {
            if (isMovieInFavs(movie)) {
                removeFromFav(movie);
                favBtn.textContent = "Ajouter aux favoris";
            } else {
                addToFav(movie);
                favBtn.textContent = "Supprimer des favoris";
            }
        });

        container.append(image, title, year, favBtn);
        results.appendChild(container);
    });
}

function addToFav(movie) {
    let favs = JSON.parse(localStorage.getItem("favs")) || [];
    if (!isMovieInFavs(movie)) {
        favs.push(movie);
        localStorage.setItem("favs", JSON.stringify(favs));
    }
}


function removeFromFav(movie) {
    let favs = JSON.parse(localStorage.getItem("favs")) || [];
    favs = favs.filter(fav => fav.imdbID !== movie.imdbID);
    localStorage.setItem("favs", JSON.stringify(favs));

   
    if (document.querySelector(".favBtn").textContent === "Favoris") {
        results.innerHTML = "";
        displayMovies(favs);
    }
}


function isMovieInFavs(movie) {
    const favs = JSON.parse(localStorage.getItem("favs")) || [];
    return favs.some(fav => fav.imdbID === movie.imdbID);
}


function filterByGenre(genre) {
    results.innerHTML = "";
    
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${input.value}`)
        .then(res => res.json())
        .then(data => {
            if (data.Search) {
                
                let filteredMovies = [];
                let requests = data.Search.map(movie =>
                    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
                        .then(res => res.json())
                        .then(movieData => {
                            if (movieData.Genre.includes(genre)) {
                                filteredMovies.push(movieData);
                            }
                        })
                );

                Promise.all(requests).then(() => {
                    if (filteredMovies.length > 0) {
                        displayMovies(filteredMovies);
                    } else {
                        results.innerHTML = `<p>Aucun film trouvé dans le genre ${genre}.</p>`;
                    }
                });
            } else {
                results.innerHTML = "<p>Aucun film trouvé.</p>";
            }
        })
        .catch(error => console.error("Erreur API :", error));
}
