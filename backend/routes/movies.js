const express = require('express');
const router = express.Router();
const {
  addMovie,
  getGroupMovies,
  getMovie,
  deleteMovie,
  getRecommendations,
  getTopRated,
} = require('../controllers/movieController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', addMovie);
router.get('/group/:groupId', getGroupMovies);
router.get('/group/:groupId/recommendations', getRecommendations);
router.get('/group/:groupId/top-rated', getTopRated);
router.get('/:id', getMovie);
router.delete('/:id', deleteMovie);

module.exports = router;
