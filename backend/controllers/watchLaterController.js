const WatchLater = require('../models/WatchLater');

const toggleWatchLater = async (req, res) => {
  try {
    const { movieId, groupId } = req.body;

    const existing = await WatchLater.findOne({
      user: req.user._id,
      movie: movieId,
      group: groupId,
    });

    if (existing) {
      await WatchLater.findByIdAndDelete(existing._id);

      return res.json({
        saved: false,
        message: 'Removed from Watch Later',
      });
    }

    await WatchLater.create({
      user: req.user._id,
      movie: movieId,
      group: groupId,
    });

    res.json({
      saved: true,
      message: 'Added to Watch Later',
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  toggleWatchLater,
};
