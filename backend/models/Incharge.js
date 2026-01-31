const mongoose = require('mongoose');

const inchargeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  region: { type: String, required: true },
  verified: { type: Boolean, default: false },
  pastWork: { type: String, default: '' },
  assignedSundays: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Incharge', inchargeSchema);
