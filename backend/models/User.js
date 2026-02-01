const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'incharge'], default: 'user' },
  preferredTimePoll: [{ day: String, timeSlot: String }],
  region: { type: String, default: '' },
  lastDriveMonth: { type: String, default: null },
  consecutiveMisses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  // Profile (area, mobile, blood group, sustainability)
  profileComplete: { type: Boolean, default: false },
  area: { type: String, default: '' },
  mobile: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  transportMode: { type: String, default: '' }, // e.g. walk, cycle, public, car
  dietPreference: { type: String, default: '' }, // e.g. veg, non-veg, vegan
  recyclingHabit: { type: String, default: '' }, // e.g. regular, sometimes, none
  energySaving: { type: [String], default: [] }, // multiple: solar, led, mindful, etc.
  waterSaving: { type: [String], default: [] }, // multiple: rainwater, low-flow, mindful, etc.
  plantAtHome: { type: Boolean, default: false },
  reusableBags: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
