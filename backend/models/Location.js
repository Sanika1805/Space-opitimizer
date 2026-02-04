const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, default: '' },
  region: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  aqi: { type: Number, default: 0 },
  bod: { type: Number, default: 0 },
  wastePerDay: { type: Number, default: 0 },
  pm25: { type: Number, default: 0 },
  pm10: { type: Number, default: 0 },
  greenCoverPercent: { type: Number, default: 0 },
  populationDensity: { type: Number, default: 0 },
  pollutionLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  priorityScore: { type: Number, default: 0 },
  garbageLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  clusterGroup: { type: Number, enum: [0, 1, 2], default: 1 },
  priorityCategory: { type: String, enum: ['Low Priority', 'Medium Priority', 'High Priority'], default: 'Medium Priority' },
  areaSqm: { type: Number, default: 0 },
  hasPond: { type: Boolean, default: false },
  plantCount: { type: Number, default: 0 },
  lastCampDate: { type: Date, default: null },
  lastAreaAlertAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
