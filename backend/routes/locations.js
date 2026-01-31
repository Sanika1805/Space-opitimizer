const express = require('express');
const router = express.Router();
const { getLocations, getPriorityLocations, createLocation } = require('../controllers/locationController');

router.get('/', getLocations);
router.get('/priority', getPriorityLocations);
router.post('/', createLocation);

module.exports = router;
