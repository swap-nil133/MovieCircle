const express = require('express');

const router = express.Router();

const {
  toggleWatchLater,
} = require('../controllers/watchLaterController');

const {
  protect,
} = require('../middleware/auth');

router.use(protect);

router.post('/toggle', toggleWatchLater);

module.exports = router;
