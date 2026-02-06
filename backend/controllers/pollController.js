const Poll = require('../models/Poll');
const User = require('../models/User');
const Location = require('../models/Location');
const {
  getHighPriorityAreasForPoll,
  decideDriveLocation,
  decidePreferredTime,
  getHighestPriorityRegion,
  getThisWeekMonday,
  getThisWeekFridayEnd,
  TIME_SLOTS
} = require('../services/aiPollService');
const { getMyAreas } = require('../services/communityService');

async function getFreshUser(userId) {
  return User.findById(userId).select('region area subscribedAreas role').lean();
}

function buildVoteCounts(poll) {
  const voteCounts = {};
  (poll.areas || []).forEach((a) => { voteCounts[a.name] = 0; });
  const voteCountsByTime = {};
  TIME_SLOTS.forEach((s) => { voteCountsByTime[s] = 0; });
  (poll.votes || []).forEach((v) => {
    if (voteCounts[v.areaName] !== undefined) voteCounts[v.areaName]++;
    if (v.timeSlot && voteCountsByTime[v.timeSlot] !== undefined) voteCountsByTime[v.timeSlot]++;
  });
  return { voteCounts, voteCountsByTime };
}

exports.generatePoll = async (req, res) => {
  try {
    const regionInput = req.body && typeof req.body.region === 'string' ? req.body.region.trim() : null;
    const fresh = await getFreshUser(req.user._id);
    const userForAreas = fresh ? { _id: req.user._id, ...fresh } : req.user;
    const myAreas = await getMyAreas(userForAreas);
    const isAdmin = userForAreas.role === 'admin';
    if (!regionInput) {
      return res.status(400).json({ message: 'Select one of your areas to create a poll for that community.' });
    }
    if (!isAdmin && !myAreas.includes(regionInput)) {
      return res.status(403).json({ message: 'You can only create polls for your area(s)' });
    }
    let region = regionInput;
    const locByName = await Location.findOne({ name: regionInput }).lean();
    if (locByName) {
      region = locByName.region;
    }
    const now = new Date();
    const pollWindowStart = getThisWeekMonday();
    const pollWindowEnd = getThisWeekFridayEnd();
    if (now > pollWindowEnd) {
      return res.status(400).json({ message: 'Poll window (Mon–Fri) has ended for this week. Create next week.' });
    }
    const existing = await Poll.findOne({
      region,
      status: 'active',
      pollWindowEnd: { $gte: now }
    });
    if (existing) {
      return res.status(400).json({ message: 'An active poll already exists for this region this week' });
    }
    const areas = await getHighPriorityAreasForPoll(region, 3);
    if (areas.length === 0) {
      return res.status(400).json({ message: 'No high-priority locations found for this region' });
    }
    const poll = await Poll.create({
      title: 'Next weekend drive',
      region,
      areas,
      status: 'active',
      pollWindowStart,
      pollWindowEnd,
      createdBy: 'ai'
    });
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function getRegionsForUser(myAreas) {
  const regions = new Set(myAreas);
  for (const a of myAreas) {
    const loc = await Location.findOne({ name: a }).select('region').lean();
    if (loc && loc.region) regions.add(loc.region);
  }
  return Array.from(regions);
}

exports.getActivePoll = async (req, res) => {
  try {
    const fresh = await getFreshUser(req.user._id);
    const userForAreas = fresh ? { _id: req.user._id, ...fresh } : req.user;
    const myAreas = await getMyAreas(userForAreas);
    if (myAreas.length === 0) {
      return res.json(null);
    }
    const regionsForPoll = await getRegionsForUser(myAreas);
    const now = new Date();
    const poll = await Poll.findOne({
      region: { $in: regionsForPoll },
      status: 'active',
      pollWindowStart: { $lte: now },
      pollWindowEnd: { $gte: now }
    })
      .sort({ createdAt: -1 })
      .lean();
    if (!poll) {
      return res.json(null);
    }
    const { voteCounts, voteCountsByTime } = buildVoteCounts(poll);
    const myVote = poll.votes.find((v) => v.user && v.user.toString() === req.user._id.toString());
    res.json({
      _id: poll._id,
      title: poll.title,
      region: poll.region,
      areas: poll.areas,
      timeSlots: TIME_SLOTS,
      status: poll.status,
      pollWindowStart: poll.pollWindowStart,
      pollWindowEnd: poll.pollWindowEnd,
      voteCounts,
      voteCountsByTime,
      myVote: myVote ? { areaName: myVote.areaName, timeSlot: myVote.timeSlot } : null,
      createdAt: poll.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.vote = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaName, timeSlot } = req.body;
    if (!areaName || typeof areaName !== 'string') {
      return res.status(400).json({ message: 'areaName is required' });
    }
    if (!timeSlot || !TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ message: 'timeSlot is required (8-11 AM, 12-3 PM, or 4-6 PM)' });
    }
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.status !== 'active') {
      return res.status(400).json({ message: 'Poll is closed' });
    }
    const now = new Date();
    if (now > poll.pollWindowEnd) {
      return res.status(400).json({ message: 'Poll voting has ended (Fri)' });
    }
    const fresh = await getFreshUser(req.user._id);
    const userForAreas = fresh ? { _id: req.user._id, ...fresh } : req.user;
    const myAreas = await getMyAreas(userForAreas);
    const regionsForPoll = await getRegionsForUser(myAreas);
    if (!regionsForPoll.includes(poll.region)) {
      return res.status(403).json({ message: 'You are not in this poll region' });
    }
    const validNames = poll.areas.map((a) => a.name);
    if (!validNames.includes(areaName.trim())) {
      return res.status(400).json({ message: 'Invalid area option' });
    }
    const already = poll.votes.some((v) => v.user.toString() === req.user._id.toString());
    if (already) {
      return res.status(400).json({ message: 'You have already voted' });
    }
    poll.votes.push({ user: req.user._id, areaName: areaName.trim(), timeSlot });
    await poll.save();
    const { voteCounts, voteCountsByTime } = buildVoteCounts(poll);
    res.json({ voteCounts, voteCountsByTime, myVote: { areaName: areaName.trim(), timeSlot } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id).lean();
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    const fresh = await getFreshUser(req.user._id);
    const userForAreas = fresh ? { _id: req.user._id, ...fresh } : req.user;
    const myAreas = await getMyAreas(userForAreas);
    const regionsForPoll = await getRegionsForUser(myAreas);
    if (!regionsForPoll.includes(poll.region)) {
      return res.status(403).json({ message: 'You are not in this poll region' });
    }
    const { voteCounts, voteCountsByTime } = buildVoteCounts(poll);
    const myVote = poll.votes.find((v) => v.user && v.user.toString() === req.user._id.toString());
    res.json({
      _id: poll._id,
      title: poll.title,
      region: poll.region,
      areas: poll.areas,
      timeSlots: TIME_SLOTS,
      status: poll.status,
      voteCounts,
      voteCountsByTime,
      myVote: myVote ? { areaName: myVote.areaName, timeSlot: myVote.timeSlot } : null,
      selectedArea: poll.selectedArea,
      selectedTimeSlot: poll.selectedTimeSlot,
      confidence: poll.confidence,
      closedAt: poll.closedAt,
      createdAt: poll.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.closePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.status === 'closed') {
      return res.status(400).json({ message: 'Poll is already closed' });
    }
    const fresh = await getFreshUser(req.user._id);
    const isIncharge = fresh && fresh.role === 'incharge';
    const isAdmin = fresh && fresh.role === 'admin';
    if (!isAdmin && !isIncharge) {
      return res.status(403).json({ message: 'Only incharge or admin can close the poll' });
    }
    const { voteCounts, voteCountsByTime } = buildVoteCounts(poll);
    const areaResult = decideDriveLocation(voteCounts);
    const timeResult = decidePreferredTime(voteCountsByTime);
    poll.status = 'closed';
    poll.selectedArea = areaResult.selectedArea;
    poll.selectedTimeSlot = timeResult.selectedTimeSlot;
    poll.confidence = areaResult.confidence;
    poll.closedAt = new Date();
    await poll.save();
    res.json({
      _id: poll._id,
      status: 'closed',
      selectedArea: areaResult.selectedArea,
      selectedTimeSlot: timeResult.selectedTimeSlot,
      confidence: areaResult.confidence,
      voteCounts,
      voteCountsByTime
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWeekendDrive = async (req, res) => {
  try {
    const fresh = await getFreshUser(req.user._id);
    const userForAreas = fresh ? { _id: req.user._id, ...fresh } : req.user;
    const myAreas = await getMyAreas(userForAreas);
    if (myAreas.length === 0) {
      return res.json(null);
    }
    const regionsForPoll = await getRegionsForUser(myAreas);
    const poll = await Poll.findOne({
      region: { $in: regionsForPoll },
      status: 'closed'
    })
      .sort({ closedAt: -1 })
      .select('region selectedArea selectedTimeSlot closedAt title')
      .lean();
    if (!poll || !poll.selectedArea) {
      return res.json(null);
    }
    res.json({
      region: poll.region,
      selectedArea: poll.selectedArea,
      selectedTimeSlot: poll.selectedTimeSlot || null,
      closedAt: poll.closedAt,
      title: poll.title
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHighestPriorityRegion = async (req, res) => {
  try {
    const result = await getHighestPriorityRegion();
    if (!result) {
      return res.json(null);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
