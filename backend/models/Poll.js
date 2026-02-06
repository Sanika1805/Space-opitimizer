const mongoose = require('mongoose');

const TIME_SLOTS = ['8-11 AM', '12-3 PM', '4-6 PM'];

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Next weekend drive' },
  region: { type: String, required: true },
  areas: [
    {
      locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
      name: { type: String, required: true }
    }
  ],
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  pollWindowStart: { type: Date, required: true },
  pollWindowEnd: { type: Date, required: true },
  votes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      areaName: { type: String, required: true },
      timeSlot: { type: String, default: null }
    }
  ],
  selectedArea: { type: String, default: null },
  selectedTimeSlot: { type: String, default: null },
  confidence: { type: Number, default: null },
  createdBy: { type: String, default: 'ai' },
  closedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

pollSchema.index({ region: 1, status: 1 });
pollSchema.index({ region: 1, pollWindowStart: 1 });

pollSchema.statics.TIME_SLOTS = TIME_SLOTS;

module.exports = mongoose.model('Poll', pollSchema);
module.exports.TIME_SLOTS = TIME_SLOTS;
