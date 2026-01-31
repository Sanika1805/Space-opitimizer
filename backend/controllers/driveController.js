const Drive = require('../models/Drive');
const Location = require('../models/Location');
const { getTasksForLocation } = require('../services/aiTasks');

exports.getDrives = async (req, res) => {
  try {
    const { region, status } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (status) filter.status = status;
    const drives = await Drive.find(filter)
      .populate('location')
      .populate('participants', 'name email')
      .sort({ date: 1 });
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDriveById = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate('location')
      .populate('participants', 'name email');
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json(drive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDrive = async (req, res) => {
  try {
    const { locationId, date, timeSlot, maxParticipants } = req.body;
    const location = await Location.findById(locationId);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    const tasks = getTasksForLocation(location);
    const drive = await Drive.create({
      location: locationId,
      region: location.region,
      date,
      timeSlot: timeSlot || '09:00-12:00',
      maxParticipants: maxParticipants || 20,
      tasks: tasks.map(t => ({ title: t, done: false }))
    });
    const populated = await Drive.findById(drive._id).populate('location');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    if (drive.participants.length >= drive.maxParticipants) {
      return res.status(400).json({ message: 'Drive is full' });
    }
    if (drive.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already joined' });
    }
    drive.participants.push(req.user._id);
    await drive.save();
    const populated = await Drive.findById(drive._id).populate('location').populate('participants', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.leaveDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    drive.participants = drive.participants.filter(p => p.toString() !== req.user._id.toString());
    await drive.save();
    res.json({ message: 'Left drive' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
