const User = require('../models/User');
const Incharge = require('../models/Incharge');
const Location = require('../models/Location');
const Drive = require('../models/Drive');
const CommunityPost = require('../models/CommunityPost');
const { getDriveInstructions } = require('./aiTasks');

/**
 * Get areas/regions the current user or incharge belongs to (for community)
 */
async function getMyAreas(user) {
  const areas = new Set();
  if (user.region) areas.add(user.region);
  if (user.area) areas.add(user.area);
  if (Array.isArray(user.subscribedAreas)) user.subscribedAreas.forEach((a) => areas.add(a));
  if (user.role === 'incharge') {
    const incharge = await Incharge.findOne({ user: user._id }).lean();
    if (incharge && incharge.region) areas.add(incharge.region);
  }
  return Array.from(areas).filter(Boolean).sort();
}

/**
 * Create AI community post for an area alert
 */
async function createPostForAreaAlert(locationId, title, body, aqiPriority, aqi) {
  const location = await Location.findById(locationId).lean();
  if (!location) return null;
  const { whatToDo, howToDo } = getDriveInstructions(location);
  return CommunityPost.create({
    region: location.region,
    location: locationId,
    type: 'area_alert',
    title,
    body,
    whatToDo,
    howToDo,
    aqiPriority,
    aqi,
    createdBy: 'ai'
  });
}

/**
 * Create AI community post for drive instructions
 */
async function createPostForDrive(driveId) {
  const drive = await Drive.findById(driveId).populate('location').lean();
  if (!drive || !drive.location) return null;
  const loc = drive.location;
  const { whatToDo, howToDo } = getDriveInstructions(loc);
  const dateStr = new Date(drive.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return CommunityPost.create({
    region: drive.region,
    location: drive.location._id,
    drive: driveId,
    type: 'drive_instructions',
    title: `Drive instructions: ${loc.name} – ${dateStr} ${drive.timeSlot || ''}`,
    body: `Cleaning drive at ${loc.name}. Follow the instructions below.`,
    whatToDo,
    howToDo,
    createdBy: 'ai'
  });
}

/**
 * Get community posts for a region (user must be in that community)
 */
async function getPostsForRegion(region, user, limit = 50) {
  const myAreas = await getMyAreas(user);
  if (!myAreas.includes(region)) {
    return { allowed: false, posts: [] };
  }
  const posts = await CommunityPost.find({ region })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('location', 'name region aqi')
    .populate('drive', 'date timeSlot status')
    .lean();
  return { allowed: true, posts };
}

/**
 * Get all community posts for current user's areas (from profile / incharge profile)
 */
async function getMyPosts(user, limit = 80) {
  const myAreas = await getMyAreas(user);
  if (myAreas.length === 0) {
    return { areas: [], posts: [] };
  }
  const posts = await CommunityPost.find({ region: { $in: myAreas } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('location', 'name region aqi')
    .populate('drive', 'date timeSlot status')
    .lean();
  return { areas: myAreas, posts };
}

module.exports = {
  getMyAreas,
  getMyPosts,
  createPostForAreaAlert,
  createPostForDrive,
  getPostsForRegion
};
