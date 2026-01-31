const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMe } = require('../controllers/authController');
const { getMyScore, submitDriveWork, completeHabit, updatePreferredTime } = require('../controllers/scoringController');

router.use(protect);

router.get('/me', getMe);
router.get('/score', getMyScore);
router.post('/score/drive', submitDriveWork);
router.post('/score/habit', completeHabit);
router.put('/preferred-time', updatePreferredTime);

module.exports = router;
