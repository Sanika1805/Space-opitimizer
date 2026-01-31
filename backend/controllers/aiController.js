const { getPriorityLocations } = require('../services/aiPriority');
const { getDailyHabit } = require('../services/aiHabits');
const Drive = require('../models/Drive');
const Location = require('../models/Location');

exports.priorityLocations = async (req, res) => {
  try {
    const locations = await getPriorityLocations(req.query);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.suggestDriveTime = async (req, res) => {
  try {
    const { locationId } = req.body;
    const location = await Location.findById(locationId);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    const existing = await Drive.find({ location: locationId, status: 'scheduled' });
    const suggested = existing.length === 0 ? 'Sunday 09:00-12:00' : 'Sunday 14:00-17:00';
    res.json({ suggestedTime: suggested, location: location.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.dailyHabit = async (req, res) => {
  try {
    const habit = await getDailyHabit();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.emergencyActions = async (req, res) => {
  try {
    const { query } = req.body;
    const lower = (query || '').toLowerCase();
    let actions = [];
    if (lower.includes('injured') || lower.includes('hurt') || lower.includes('accident')) {
      actions = [
        'Call emergency: 112/102',
        'Do not move the person if spine/neck injury suspected',
        'Apply first aid for bleeding if trained',
        'Keep the person calm and warm until help arrives'
      ];
    } else if (lower.includes('snake') || lower.includes('bite')) {
      actions = ['Keep calm', 'Call medical help immediately', 'Note snake appearance if safe', 'Keep limb still'];
    } else {
      actions = [
        'Stay calm and assess the situation',
        'Call emergency if needed: 112',
        'Inform incharge and other participants',
        'Move to safe area if required'
      ];
    }
    res.json({ query, actions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
