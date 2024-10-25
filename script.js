const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNGE2MzRjYjlhMWI4NTQ5YzY1MzkwOTQzNjI4Yzg1YyIsIm5iZiI6MTcyOTg4MDIxNC4zOTQ0OTEsInN1YiI6IjY3MWE2YWExNWQwZGU4OTA0MmQ4ZWNjMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dQ4RMlnRBYWhJ5bLhTSq3BIA4WuAMFvVOtmgYP8IGYU';

const baseUrl = 'https://api.themoviedb.org/3';
const trendingMoviesEndpoint = `${baseUrl}/trending/movie/week`;
const searchEndpoint = `${baseUrl}/search/movie?query=`;
const genreEndpoint = `${baseUrl}/genre/movie/list`;
const discoverEndpoint = `${baseUrl}/discover/movie`;

// Fetch trending movies on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingMovies();
    fetchMovieCategories();
    setupSearch();
});

// Fetch trending movies
async function fetchTrendingMovies() {
    showLoadingIndicator();
    try {
        const response = await fetch(trendingMoviesEndpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        renderMovies(data.results, '#trending-list');
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        showError('Failed to load trending movies.');
    } finally {
        hideLoadingIndicator();
    }
}

// Fetch movie categories (genres)
async function fetchMovieCategories() {
    try {
        const response = await fetch(genreEndpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        renderCategoryButtons(data.genres);
    } catch (error) {
        console.error('Error fetching movie categories:', error);
        showError('Failed to load movie categories.');
    }
}

// Render category buttons
function renderCategoryButtons(categories) {
    const categoriesContainer = document.getElementById('categories-container');
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.onclick = () => fetchMoviesByCategory(category.id);
        categoriesContainer.appendChild(button);
    });
}

// Fetch movies by category (genre)
async function fetchMoviesByCategory(genreId) {
    showLoadingIndicator();
    try {
        const response = await fetch(`${discoverEndpoint}?with_genres=${genreId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        renderMovies(data.results, '#trending-list');  // Reuse same container for displaying category movies
    } catch (error) {
        console.error('Error fetching movies by category:', error);
        showError('Failed to load movies for this category.');
    } finally {
        hideLoadingIndicator();
    }
}

// Setup search functionality
function setupSearch() {
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            try {
                const response = await fetch(searchEndpoint + query, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                renderMovies(data.results, '#trending-list');
            } catch (error) {
                console.error('Error searching for movies:', error);
                showError('Failed to search for movies.');
            }
        }
    });
}

// Render movie data
function renderMovies(movies, containerSelector) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = movies.map(movie => `
        <div class="movie">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button onclick="addToWatchlist('${movie.title}')">Add to Watchlist</button>
        </div>
    `).join('');
}

// Add to watchlist
function addToWatchlist(movieTitle) {
    const watchlist = document.getElementById('watchlist-items');
    const listItem = document.createElement('li');
    listItem.textContent = movieTitle;
    listItem.id = movieTitle; // Set id for easy removal
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => removeFromWatchlist(movieTitle); // Bind the remove function
    listItem.appendChild(removeButton);
    watchlist.appendChild(listItem);
    
    // Save to localStorage
    let savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!savedWatchlist.includes(movieTitle)) { // Prevent duplicates
        savedWatchlist.push(movieTitle);
        localStorage.setItem('watchlist', JSON.stringify(savedWatchlist));
    }
}

// Remove from watchlist
function removeFromWatchlist(movieTitle) {
    const watchlist = document.getElementById('watchlist-items');
    const listItem = document.getElementById(movieTitle);
    if (listItem) {
        watchlist.removeChild(listItem);
    }
    
    // Update localStorage
    let savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    savedWatchlist = savedWatchlist.filter(movie => movie !== movieTitle); // Remove the movie
    localStorage.setItem('watchlist', JSON.stringify(savedWatchlist));
}

// Load watchlist on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    savedWatchlist.forEach(movie => addToWatchlist(movie));
});

// Error handling
function showError(message) {
    const errorElement = document.createElement('p');
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
}

// Loading indicator
function showLoadingIndicator() {
    document.body.classList.add('loading');
}

function hideLoadingIndicator() {
    document.body.classList.remove('loading');
}