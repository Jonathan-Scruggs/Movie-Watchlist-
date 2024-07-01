import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the root directory
app.use(express.static(__dirname));

// Endpoint to search movies by title
app.get('/api/movies', async (req, res) => {
    const query = req.query.q;
    const response = await fetch(`http://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
    const data = await response.json();
    res.json(data);
});

// Endpoint to get movie details by ID
app.get('/api/movie-details', async (req, res) => {
    const id = req.query.i; // Changed from 't' to 'i'
    const response = await fetch(`http://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`); // Changed from 't' to 'i'
    const data = await response.json();
    res.json(data);
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
