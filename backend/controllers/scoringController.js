const Score = require('../models/Score');
const User = require('../models/User');
const { calculateScoreFromWork, applyConsistencyPenalty } = require('../services/aiScoring');

exports.getMyScore = async (req, res) => {
  try {
    let score = await Score.findOne({ user: req.user._id });
    if (!score) score = await Score.create({ user: req.user._id });
    const user = await User.findById(req.user._id);
    const updated = await applyConsistencyPenalty(score, user);
    if (updated) await updated.save();
    const final = await Score.findOne({ user: req.user._id });
    res.json(final);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitDriveWork = async (req, res) => {
  try {
    const { timeMinutes, plantsPlanted, areaCleanedSqm, wasteGatheredKg } = req.body;
    let score = await Score.findOne({ user: req.user._id });
    if (!score) score = await Score.create({ user: req.user._id });
    const updates = calculateScoreFromWork({
      timeMinutes: timeMinutes || 0,
      plantsPlanted: plantsPlanted || 0,
      areaCleanedSqm: areaCleanedSqm || 0,
      wasteGatheredKg: wasteGatheredKg || 0
    });
    score.coins += updates.coins;
    score.totalTimeMinutes += updates.timeMinutes;
    score.plantsPlanted += updates.plantsPlanted;
    score.areaCleanedSqm += updates.areaCleanedSqm;
    score.wasteGatheredKg += updates.wasteGatheredKg;
    score.aqiReduced += updates.aqiReduced;
    score.carbonFootprintReducedKg += updates.carbonFootprintReducedKg;
    score.virtualJungleLevel = Math.floor(score.coins / 50);
    await score.save();
    res.json(score);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeHabit = async (req, res) => {
  try {
    const { points } = req.body;
    let score = await Score.findOne({ user: req.user._id });
    if (!score) score = await Score.create({ user: req.user._id });
    score.habitCompletions += 1;
    score.coins += points || 5;
    score.virtualJungleLevel = Math.floor(score.coins / 50);
    await score.save();
    res.json(score);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePreferredTime = async (req, res) => {
  try {
    const { preferredTimePoll } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferredTimePoll: preferredTimePoll || [] },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
