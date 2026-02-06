const express = require('express');
const router = express.Router();
const { protect, inchargeOnly } = require('../middleware/auth');
const {
  priorityLocations,
  priorityByRegion,
  suggestDriveTime,
  dailyHabit,
  emergencyActions
} = require('../controllers/aiController');

router.get('/locations/priority', priorityLocations);
router.get('/locations/priority-by-region', priorityByRegion);
router.post('/suggest-time', suggestDriveTime);
router.get('/habit/daily', dailyHabit);
router.post('/emergency', protect, inchargeOnly, emergencyActions);

module.exports = router;
