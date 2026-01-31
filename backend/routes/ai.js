const express = require('express');
const router = express.Router();
const { protect, inchargeOnly } = require('../middleware/auth');
const {
  priorityLocations,
  suggestDriveTime,
  dailyHabit,
  emergencyActions
} = require('../controllers/aiController');

router.get('/locations/priority', priorityLocations);
router.post('/suggest-time', suggestDriveTime);
router.get('/habit/daily', dailyHabit);
router.post('/emergency', protect, inchargeOnly, emergencyActions);

module.exports = router;
