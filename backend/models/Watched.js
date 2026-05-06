const mongoose = require('mongoose');

const watchedSchema = new mongoose.Schema(
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
    watched: {
      type: Boolean,
      default: true,
    },
    watchedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index: one watched entry per user per movie per group
watchedSchema.index({ user: 1, movie: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Watched', watchedSchema);
