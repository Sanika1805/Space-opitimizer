const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generatePoll,
  getActivePoll,
  getWeekendDrive,
  getHighestPriorityRegion,
  vote,
  getPoll,
  closePoll
} = require('../controllers/pollController');

router.use(protect);

router.post('/generate', generatePoll);
router.get('/active', getActivePoll);
router.get('/weekend-drive', getWeekendDrive);
router.get('/highest-priority-region', getHighestPriorityRegion);
router.get('/:id', getPoll);
router.post('/:id/vote', vote);
router.post('/:id/close', closePoll);

module.exports = router;
