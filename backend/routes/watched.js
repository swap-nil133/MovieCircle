const express = require('express');

const router = express.Router();

const {
  toggleWatched,
  getMovieWatched,
} = require('../controllers/watchedController');

const {
  protect,
} = require('../middleware/auth');

router.use(protect);

router.post('/toggle', toggleWatched);

router.get(
  '/movie/:movieId/group/:groupId',
  getMovieWatched
);

module.exports = router;
