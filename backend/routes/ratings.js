const express = require('express');
const router = express.Router();
const { rateMovie, removeRating, getMovieRatings } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', rateMovie);
router.delete('/:movieId/:groupId', removeRating);
router.get('/movie/:movieId/group/:groupId', getMovieRatings);

module.exports = router;
