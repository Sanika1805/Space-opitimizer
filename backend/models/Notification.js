const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['area_alert', 'system'], default: 'area_alert' },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  areaName: { type: String },
  aqi: { type: Number },
  aqiPriority: { type: String, enum: ['Low', 'Medium', 'High'] },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
