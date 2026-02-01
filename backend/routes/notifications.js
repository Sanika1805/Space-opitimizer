const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getMyNotifications,
  markRead,
  markAllRead,
  sendAreaAlert,
  sendAllAreaAlerts
} = require('../controllers/notificationController');

router.get('/', protect, getMyNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markRead);
router.post('/send-area-alert', protect, adminOnly, sendAreaAlert);
router.post('/send-all-area-alerts', protect, adminOnly, sendAllAreaAlerts);

module.exports = router;
