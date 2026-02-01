const mongoose = require('mongoose');

const inchargeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  region: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  pastWork: { type: String, default: '' },
  assignedSundays: [{ type: String }],
  // Verification form fields
  mobile: { type: String, default: '' },
  previousExperience: { type: String, default: '' },
  certifications: [{ type: String }], // file paths
  yearsExperience: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  verificationSubmitted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Incharge', inchargeSchema);
