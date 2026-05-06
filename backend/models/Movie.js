const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    imdbId: {
      type: String,
      required: true,
    },
    tmdbId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    poster: {
      type: String,
      default: '',
    },
    backdrop: {
      type: String,
      default: '',
    },
    releaseYear: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    genres: [
      {
        type: String,
      },
    ],
    overview: {
      type: String,
      default: '',
    },
    runtime: {
      type: Number,
      default: 0,
    },
    tmdbRating: {
      type: Number,
      default: 0,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: same movie can't be added twice to same group
movieSchema.index({ imdbId: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Movie', movieSchema);
