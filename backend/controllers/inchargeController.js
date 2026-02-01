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

// Submit verification form (after incharge signup): mobile, experience, certifications, etc.
exports.submitVerification = async (req, res) => {
  try {
    const { mobile, previousExperience, region, yearsExperience, emergencyContact } = req.body;
    const certPaths = (req.files || []).map((f) => '/uploads/certificates/' + f.filename);

    let incharge = await Incharge.findOne({ user: req.user._id });
    if (incharge) {
      incharge.mobile = mobile || incharge.mobile;
      incharge.previousExperience = previousExperience || incharge.previousExperience;
      incharge.region = region || incharge.region;
      incharge.yearsExperience = yearsExperience || incharge.yearsExperience;
      incharge.emergencyContact = emergencyContact || incharge.emergencyContact;
      incharge.certifications = certPaths.length ? certPaths : incharge.certifications;
      incharge.verificationSubmitted = true;
      await incharge.save();
    } else {
      incharge = await Incharge.create({
        user: req.user._id,
        mobile: mobile || '',
        previousExperience: previousExperience || '',
        region: region || '',
        yearsExperience: yearsExperience || '',
        emergencyContact: emergencyContact || '',
        certifications: certPaths,
        verificationSubmitted: true,
        verified: false
      });
    }
    const populated = await Incharge.findById(incharge._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
