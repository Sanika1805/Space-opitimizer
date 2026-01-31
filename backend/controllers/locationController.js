const Location = require('../models/Location');
const { getPriorityLocations } = require('../services/aiPriority');

exports.getLocations = async (req, res) => {
  try {
    const { region } = req.query;
    const filter = region ? { region } : {};
    const locations = await Location.find(filter);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPriorityLocations = async (req, res) => {
  try {
    const locations = await getPriorityLocations(req.query);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
