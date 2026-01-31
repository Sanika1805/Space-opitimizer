const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  region: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  maxParticipants: { type: Number, default: 20 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  incharge: { type: mongoose.Schema.Types.ObjectId, ref: 'Incharge' },
  tasks: [{ title: String, done: Boolean }],
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Drive', driveSchema);
