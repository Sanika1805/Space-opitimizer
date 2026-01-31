const Incharge = require('../models/Incharge');
const User = require('../models/User');

exports.getInchargeProfile = async (req, res) => {
  try {
    const incharge = await Incharge.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!incharge) return res.status(404).json({ message: 'Incharge profile not found' });
    res.json(incharge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.applyIncharge = async (req, res) => {
  try {
    const { region, pastWork } = req.body;
    let incharge = await Incharge.findOne({ user: req.user._id });
    if (incharge) return res.status(400).json({ message: 'Already applied' });
    incharge = await Incharge.create({
      user: req.user._id,
      region,
      pastWork: pastWork || '',
      verified: false
    });
    await User.findByIdAndUpdate(req.user._id, { role: 'incharge' });
    res.status(201).json(incharge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyIncharge = async (req, res) => {
  try {
    const incharge = await Incharge.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    ).populate('user', 'name email');
    if (!incharge) return res.status(404).json({ message: 'Incharge not found' });
    res.json(incharge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
