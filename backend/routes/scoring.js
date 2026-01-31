const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyScore, submitDriveWork, completeHabit, updatePreferredTime } = require('../controllers/scoringController');

router.use(protect);

router.get('/', getMyScore);
router.post('/drive', submitDriveWork);
router.post('/habit', completeHabit);
router.put('/preferred-time', updatePreferredTime);

module.exports = router;
