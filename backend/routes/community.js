const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyAreas, getMyPosts, getPosts } = require('../controllers/communityController');

router.use(protect);
router.get('/my-areas', getMyAreas);
router.get('/my-posts', getMyPosts);
router.get('/posts', getPosts);

module.exports = router;
