const Watched = require('../models/Watched');
const Movie = require('../models/Movie');
const Group = require('../models/Group');

// POST /api/watched - Mark or unmark a movie as watched
const toggleWatched = async (req, res) => {
  try {
    const { movieId, groupId } = req.body;

    if (!movieId || !groupId) {
      return res.status(400).json({ message: 'movieId and groupId are required' });
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

    // Check existing watched status
    const existing = await Watched.findOne({
      user: req.user._id,
      movie: movieId,
      group: groupId,
    });

    if (existing) {
      // Toggle: if already watched, remove it
      if (existing.watched) {
        await Watched.findByIdAndDelete(existing._id);
        return res.json({ message: 'Marked as unwatched', watched: false, watchedDate: null });
      } else {
        // Update to watched with new date
        existing.watched = true;
        existing.watchedDate = new Date();
        await existing.save();
        const populated = await Watched.findById(existing._id).populate('user', 'username email');
        return res.json({ message: 'Marked as watched', watched: true, watchedDate: existing.watchedDate, entry: populated });
      }
    } else {
      // Create new watched entry
      const watchedEntry = await Watched.create({
        user: req.user._id,
        movie: movieId,
        group: groupId,
        watched: true,
        watchedDate: new Date(),
      });
      const populated = await Watched.findById(watchedEntry._id).populate('user', 'username email');
      return res.status(201).json({ message: 'Marked as watched', watched: true, watchedDate: watchedEntry.watchedDate, entry: populated });
    }
  } catch (error) {
    console.error('Toggle watched error:', error);
    res.status(500).json({ message: 'Server error updating watched status' });
  }
};

// GET /api/watched/movie/:movieId/group/:groupId - Get all watched entries for a movie
const getMovieWatched = async (req, res) => {
  try {
    const { movieId, groupId } = req.params;

    const watchedList = await Watched.find({
      movie: movieId,
      group: groupId,
      watched: true,
    }).populate('user', 'username email').sort({ watchedDate: -1 });

    const userWatched = watchedList.find(
      (w) => w.user._id.toString() === req.user._id.toString()
    );

    res.json({
      watchedBy: watchedList,
      userWatched: !!userWatched,
      userWatchedDate: userWatched ? userWatched.watchedDate : null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching watched status' });
  }
};

module.exports = { toggleWatched, getMovieWatched };
