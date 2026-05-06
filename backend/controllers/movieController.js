const Movie = require('../models/Movie');
const Group = require('../models/Group');
const Rating = require('../models/Rating');
const Watched = require('../models/Watched');
const { extractImdbId, fetchMovieByImdbId } = require('../utils/tmdb');

// POST /api/movies - Add a movie to a group
const addMovie = async (req, res) => {
  try {
    const { imdbLink, groupId } = req.body;

    if (!imdbLink || !groupId) {
      return res.status(400).json({ message: 'IMDb link and group ID are required' });
    }

    // Validate group membership
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Extract IMDb ID
    const imdbId = extractImdbId(imdbLink);
    if (!imdbId) {
      return res.status(400).json({
        message: 'Invalid IMDb link. Please use a valid IMDb URL (e.g., https://www.imdb.com/title/tt1234567/)',
      });
    }

    // Check for duplicate in same group
    const existingMovie = await Movie.findOne({ imdbId, group: groupId });
    if (existingMovie) {
      return res.status(400).json({ message: 'This movie is already in this group' });
    }

    // Fetch movie details from TMDb
    let movieData;
    try {
      movieData = await fetchMovieByImdbId(imdbId);
    } catch (tmdbError) {
      return res.status(400).json({ message: tmdbError.message || 'Could not fetch movie details from TMDb' });
    }

    // Create movie
    const movie = await Movie.create({
      ...movieData,
      group: groupId,
      addedBy: req.user._id,
    });

    // Add movie to group
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { movies: movie._id },
    });

    const populated = await Movie.findById(movie._id).populate('addedBy', 'username email');

    res.status(201).json({ message: 'Movie added successfully', movie: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This movie is already in this group' });
    }
    console.error('Add movie error:', error);
    res.status(500).json({ message: 'Server error adding movie' });
  }
};

// GET /api/movies/group/:groupId - Get all movies in a group
const getGroupMovies = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { genre, minRating, language } = req.query;

    // Validate group membership
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Build query
    const query = { group: groupId };
    if (genre) query.genres = genre;
    if (language) query.language = language;

    const movies = await Movie.find(query)
      .populate('addedBy', 'username email')
      .sort({ createdAt: -1 });

    // Fetch ratings and watched status for each movie
    const movieIds = movies.map((m) => m._id);

    const [allRatings, allWatched] = await Promise.all([
      Rating.find({ movie: { $in: movieIds }, group: groupId }).populate('user', 'username email'),
      Watched.find({ movie: { $in: movieIds }, group: groupId }).populate('user', 'username email'),
    ]);

    // Build maps
    const ratingsMap = {};
    allRatings.forEach((r) => {
      if (!ratingsMap[r.movie.toString()]) ratingsMap[r.movie.toString()] = [];
      ratingsMap[r.movie.toString()].push(r);
    });

    const watchedMap = {};
    allWatched.forEach((w) => {
      if (!watchedMap[w.movie.toString()]) watchedMap[w.movie.toString()] = [];
      watchedMap[w.movie.toString()].push(w);
    });

    // Enrich movies with ratings and watched info
    let enrichedMovies = movies.map((movie) => {
      const movieId = movie._id.toString();
      const ratings = ratingsMap[movieId] || [];
      const watchedList = watchedMap[movieId] || [];

      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      const userRating = ratings.find(
        (r) => r.user._id.toString() === req.user._id.toString()
      );

      const userWatched = watchedList.find(
        (w) => w.user._id.toString() === req.user._id.toString()
      );

      return {
        ...movie.toObject(),
        ratings,
        avgRating: Math.round(avgRating * 10) / 10,
        watchedBy: watchedList,
        userRating: userRating ? userRating.rating : null,
        userWatched: userWatched ? userWatched.watched : false,
        userWatchedDate: userWatched ? userWatched.watchedDate : null,
      };
    });

    // Filter by minimum rating
    if (minRating) {
      enrichedMovies = enrichedMovies.filter(
        (m) => m.avgRating >= parseFloat(minRating)
      );
    }

    res.json({ movies: enrichedMovies });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ message: 'Server error fetching movies' });
  }
};

// GET /api/movies/:id - Get single movie with details
const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('addedBy', 'username email');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Validate group membership
    const group = await Group.findById(movie.group);
    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [ratings, watchedList] = await Promise.all([
      Rating.find({ movie: movie._id, group: movie.group }).populate('user', 'username email'),
      Watched.find({ movie: movie._id, group: movie.group }).populate('user', 'username email'),
    ]);

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    res.json({
      movie: {
        ...movie.toObject(),
        ratings,
        avgRating: Math.round(avgRating * 10) / 10,
        watchedBy: watchedList,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching movie' });
  }
};

// DELETE /api/movies/:id - Remove movie from group
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Only movie adder or group owner can delete
    const group = await Group.findById(movie.group);
    const isOwner = group.owner.toString() === req.user._id.toString();
    const isAdder = movie.addedBy.toString() === req.user._id.toString();

    if (!isOwner && !isAdder) {
      return res.status(403).json({ message: 'Not authorized to remove this movie' });
    }

    await Movie.findByIdAndDelete(movie._id);
    await Group.findByIdAndUpdate(movie.group, { $pull: { movies: movie._id } });
    await Rating.deleteMany({ movie: movie._id });
    await Watched.deleteMany({ movie: movie._id });

    res.json({ message: 'Movie removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting movie' });
  }
};

// GET /api/movies/group/:groupId/recommendations
const getRecommendations = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    // Get movies user hasn't watched
    const watchedByUser = await Watched.find({
      group: groupId,
      user: req.user._id,
      watched: true,
    }).select('movie');

    const watchedMovieIds = watchedByUser.map((w) => w.movie.toString());

    const unwatchedMovies = await Movie.find({
      group: groupId,
      _id: { $nin: watchedMovieIds },
    }).populate('addedBy', 'username email');

    // Get ratings for unwatched movies
    const movieIds = unwatchedMovies.map((m) => m._id);
    const ratings = await Rating.find({ movie: { $in: movieIds }, group: groupId });

    const ratingsMap = {};
    ratings.forEach((r) => {
      if (!ratingsMap[r.movie.toString()]) ratingsMap[r.movie.toString()] = [];
      ratingsMap[r.movie.toString()].push(r.rating);
    });

    const enriched = unwatchedMovies.map((movie) => {
      const movieRatings = ratingsMap[movie._id.toString()] || [];
      const avgRating =
        movieRatings.length > 0
          ? movieRatings.reduce((s, r) => s + r, 0) / movieRatings.length
          : 0;
      return { ...movie.toObject(), avgRating: Math.round(avgRating * 10) / 10 };
    });

    // Sort by avgRating desc
    enriched.sort((a, b) => b.avgRating - a.avgRating);

    res.json({ recommendations: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
};

// GET /api/movies/group/:groupId/top-rated
const getTopRated = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const movies = await Movie.find({ group: groupId }).populate('addedBy', 'username email');
    const movieIds = movies.map((m) => m._id);
    const ratings = await Rating.find({ movie: { $in: movieIds }, group: groupId });

    const ratingsMap = {};
    ratings.forEach((r) => {
      if (!ratingsMap[r.movie.toString()]) ratingsMap[r.movie.toString()] = [];
      ratingsMap[r.movie.toString()].push(r.rating);
    });

    const enriched = movies
      .map((movie) => {
        const movieRatings = ratingsMap[movie._id.toString()] || [];
        const avgRating =
          movieRatings.length > 0
            ? movieRatings.reduce((s, r) => s + r, 0) / movieRatings.length
            : 0;
        return { ...movie.toObject(), avgRating: Math.round(avgRating * 10) / 10 };
      })
      .filter((m) => m.avgRating > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);

    res.json({ movies: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching top rated' });
  }
};

module.exports = { addMovie, getGroupMovies, getMovie, deleteMovie, getRecommendations, getTopRated };
