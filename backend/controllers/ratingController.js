const Rating = require('../models/Rating');
const Movie = require('../models/Movie');
const Group = require('../models/Group');

// POST /api/ratings - Add or update a rating
const rateMovie = async (req, res) => {
  try {
    const { movieId, groupId, rating } = req.body;

    if (!movieId || !groupId || rating === undefined) {
      return res.status(400).json({ message: 'movieId, groupId, and rating are required' });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 1 and 10' });
    }

    // Validate movie and group
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: 'You are not a member of this group' });

    // Upsert rating
    const existingRating = await Rating.findOneAndUpdate(
      { user: req.user._id, movie: movieId, group: groupId },
      { rating },
      { upsert: true, new: true }
    ).populate('user', 'username email');

    // Calculate new average
    const allRatings = await Rating.find({ movie: movieId, group: groupId });
    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

    res.json({
      message: 'Rating saved successfully',
      rating: existingRating,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error('Rate movie error:', error);
    res.status(500).json({ message: 'Server error saving rating' });
  }
};

// DELETE /api/ratings/:movieId/:groupId - Remove a rating
const removeRating = async (req, res) => {
  try {
    const { movieId, groupId } = req.params;

    const deleted = await Rating.findOneAndDelete({
      user: req.user._id,
      movie: movieId,
      group: groupId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json({ message: 'Rating removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing rating' });
  }
};

// GET /api/ratings/movie/:movieId/group/:groupId - Get all ratings for a movie
const getMovieRatings = async (req, res) => {
  try {
    const { movieId, groupId } = req.params;

    const ratings = await Rating.find({ movie: movieId, group: groupId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    res.json({
      ratings,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching ratings' });
  }
};

module.exports = { rateMovie, removeRating, getMovieRatings };
