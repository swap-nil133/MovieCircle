const mongoose = require('mongoose');

const watchLaterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
  },
  { timestamps: true }
);

watchLaterSchema.index(
  {
    user: 1,
    movie: 1,
    group: 1,
  },
  { unique: true }
);

module.exports = mongoose.model(
  'WatchLater',
  watchLaterSchema
);
