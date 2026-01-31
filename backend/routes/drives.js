const express = require('express');
const router = express.Router();
const { protect, inchargeOnly } = require('../middleware/auth');
const {
  getDrives,
  getDriveById,
  createDrive,
  joinDrive,
  leaveDrive
} = require('../controllers/driveController');

router.get('/', getDrives);
router.get('/:id', getDriveById);
router.post('/', protect, inchargeOnly, createDrive);
router.post('/:id/join', protect, joinDrive);
router.post('/:id/leave', protect, leaveDrive);

module.exports = router;
