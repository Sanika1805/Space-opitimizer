const Notification = require('../models/Notification');
const { sendAreaAlert, sendAllAreaAlerts } = require('../services/areaNotifications');

exports.getMyNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    const filter = { user: req.user._id };
    if (unreadOnly === 'true') filter.read = false;
    const list = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('location', 'name region aqi')
      .lean();
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications: list, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendAreaAlert = async (req, res) => {
  try {
    const { locationId } = req.body;
    if (!locationId) return res.status(400).json({ message: 'locationId required' });
    const result = await sendAreaAlert(locationId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendAllAreaAlerts = async (req, res) => {
  try {
    const { region } = req.body;
    const results = await sendAllAreaAlerts(region);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
