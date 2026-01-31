const express = require('express');
const router = express.Router();
const { protect, inchargeOnly } = require('../middleware/auth');
const { getInchargeProfile, applyIncharge, verifyIncharge } = require('../controllers/inchargeController');

router.get('/profile', protect, inchargeOnly, getInchargeProfile);
router.post('/apply', protect, applyIncharge);
router.put('/:id/verify', protect, verifyIncharge);

module.exports = router;
