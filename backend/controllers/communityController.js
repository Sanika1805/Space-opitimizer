const User = require('../models/User');
const { getMyAreas, getMyPosts, getPostsForRegion } = require('../services/communityService');

async function getFreshUser(userId) {
  return User.findById(userId).select('region area subscribedAreas role').lean();
}

exports.getMyAreas = async (req, res) => {
  try {
    const fresh = await getFreshUser(req.user._id);
    const areas = await getMyAreas(fresh || req.user);
    res.json({ areas });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const fresh = await getFreshUser(req.user._id);
    const userForAreas = fresh ? { _id: req.user._id, ...fresh } : req.user;
    const { areas, posts } = await getMyPosts(userForAreas);
    res.json({ areas, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { region } = req.query;
    if (!region) return res.status(400).json({ message: 'region required' });
    const result = await getPostsForRegion(region, req.user, 50);
    if (!result.allowed) return res.status(403).json({ message: 'You are not part of this area community' });
    res.json({ posts: result.posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
