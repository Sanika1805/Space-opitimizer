const express = require('express');
const router = express.Router();
const { protect, inchargeOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getInchargeProfile, applyIncharge, verifyIncharge, submitVerification } = require('../controllers/inchargeController');

router.get('/profile', protect, inchargeOnly, getInchargeProfile);
router.post('/apply', protect, applyIncharge);
router.put('/:id/verify', protect, verifyIncharge);
router.post('/verification', protect, inchargeOnly, upload.array('certifications', 5), submitVerification);

module.exports = router;
