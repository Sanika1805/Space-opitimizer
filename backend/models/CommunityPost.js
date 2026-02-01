const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  region: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
  type: { type: String, enum: ['area_alert', 'drive_instructions'], required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  whatToDo: [{ type: String }],
  howToDo: [{ type: String }],
  aqiPriority: { type: String, enum: ['Low', 'Medium', 'High'] },
  aqi: { type: Number },
  createdBy: { type: String, default: 'ai' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
