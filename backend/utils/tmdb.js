const axios = require('axios');

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

/**
 * Extract IMDb ID from an IMDb URL
 * Supports formats like:
 *   https://www.imdb.com/title/tt1234567/
 *   https://imdb.com/title/tt1234567
 *   tt1234567
 */
const extractImdbId = (input) => {
  if (!input) return null;

  // Direct IMDb ID
  if (/^tt\d{7,8}$/.test(input.trim())) {
    return input.trim();
  }

  // IMDb URL
  const match = input.match(/imdb\.com\/title\/(tt\d{7,8})/i);
  if (match) return match[1];

  return null;
};

/**
 * Fetch movie details from TMDb using IMDb ID
 */
const fetchMovieByImdbId = async (imdbId) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDb API key not configured');

  // Find TMDb movie using IMDb ID
  const findResponse = await axios.get(`${TMDB_BASE_URL}/find/${imdbId}`, {
    params: {
      api_key: apiKey,
      external_source: 'imdb_id',
    },
  });

  const movieResults = findResponse.data.movie_results;
  if (!movieResults || movieResults.length === 0) {
    throw new Error('Movie not found on TMDb for the given IMDb ID');
  }

  const tmdbMovie = movieResults[0];
  const tmdbId = tmdbMovie.id.toString();

  // Fetch full movie details
  const detailResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
    params: { api_key: apiKey },
  });

  const details = detailResponse.data;

  return {
    tmdbId,
    imdbId,
    title: details.title,
    poster: details.poster_path ? `${TMDB_IMAGE_BASE}${details.poster_path}` : '',
    backdrop: details.backdrop_path ? `${TMDB_BACKDROP_BASE}${details.backdrop_path}` : '',
    releaseYear: details.release_date ? details.release_date.substring(0, 4) : '',
    language: details.original_language || '',
    genres: details.genres ? details.genres.map((g) => g.name) : [],
    overview: details.overview || '',
    runtime: details.runtime || 0,
    tmdbRating: details.vote_average || 0,
  };
};

module.exports = { extractImdbId, fetchMovieByImdbId };
