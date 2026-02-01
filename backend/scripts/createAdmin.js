/**
 * Create the first admin user.
 * Run from backend folder: node scripts/createAdmin.js
 * Or: node scripts/createAdmin.js admin@example.com MyPassword123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/green-space-optimizer';

async function main() {
  const email = process.argv[2] || 'admin@greenspace.com';
  const password = process.argv[3] || 'admin123';

  await mongoose.connect(MONGO_URI);
  const exists = await User.findOne({ email });
  if (exists) {
    await User.findByIdAndUpdate(exists._id, { role: 'admin' });
    console.log('Existing user updated to admin:', email);
  } else {
    await User.create({ name: 'Admin', email, password, role: 'admin' });
    console.log('Admin user created:', email);
  }
  console.log('Login at /login with the above email and password.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
