const express = require('express');
const router = express.Router();
const { createGroup, getMyGroups, getGroup, joinGroup, leaveGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createGroup);
router.get('/', getMyGroups);
router.get('/:id', getGroup);
router.post('/join', joinGroup);
router.delete('/:id/leave', leaveGroup);

module.exports = router;
