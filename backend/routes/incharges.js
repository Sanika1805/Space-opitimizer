const express = require('express');
const router = express.Router();
const { protect, inchargeOnly, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getInchargeProfile, applyIncharge, listIncharges, getInchargeById, verifyIncharge, submitVerification } = require('../controllers/inchargeController');

router.get('/profile', protect, inchargeOnly, getInchargeProfile);
router.post('/apply', protect, applyIncharge);
router.post('/verification', protect, inchargeOnly, upload.array('certifications', 5), submitVerification);

// Admin only
router.get('/', protect, adminOnly, listIncharges);
router.get('/:id', protect, adminOnly, getInchargeById);
router.put('/:id/verify', protect, adminOnly, verifyIncharge);

module.exports = router;
