const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coins: { type: Number, default: 0 },
  totalTimeMinutes: { type: Number, default: 0 },
  plantsPlanted: { type: Number, default: 0 },
  areaCleanedSqm: { type: Number, default: 0 },
  wasteGatheredKg: { type: Number, default: 0 },
  aqiReduced: { type: Number, default: 0 },
  carbonFootprintReducedKg: { type: Number, default: 0 },
  virtualJungleLevel: { type: Number, default: 0 },
  habitCompletions: { type: Number, default: 0 },
  penaltyApplied: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
