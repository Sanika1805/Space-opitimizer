const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, enum: ['daily', 'home', 'sustainability'], default: 'daily' },
  points: { type: Number, default: 5 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
