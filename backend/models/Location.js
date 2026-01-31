const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  aqi: { type: Number, default: 0 },
  garbageLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  areaSqm: { type: Number, default: 0 },
  hasPond: { type: Boolean, default: false },
  plantCount: { type: Number, default: 0 },
  lastCampDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
