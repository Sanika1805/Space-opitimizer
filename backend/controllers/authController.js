const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Score = require('../models/Score');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, role: role || 'user' });
    await Score.create({ user: user._id });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      'area', 'region', 'subscribedAreas', 'mobile', 'bloodGroup', 'transportMode', 'dietPreference',
      'recyclingHabit', 'energySaving', 'waterSaving', 'plantAtHome', 'reusableBags'
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] === undefined) return;
      if (key === 'energySaving' || key === 'waterSaving' || key === 'subscribedAreas') {
        updates[key] = Array.isArray(req.body[key]) ? req.body[key] : [req.body[key]].filter(Boolean);
      } else {
        updates[key] = req.body[key];
      }
    });
    updates.profileComplete = true;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
