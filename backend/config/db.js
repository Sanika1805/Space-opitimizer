const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MongoDB connection error: MONGO_URI is not set in .env');
    console.error('Add MONGO_URI=mongodb://localhost:27017/green-space-optimizer for local MongoDB');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.error('');
      console.error('If using MongoDB Atlas (mongodb+srv://...):');
      console.error('  1. Check internet connection and try again.');
      console.error('  2. In Atlas: Network Access -> add your IP (or 0.0.0.0/0 for testing).');
      console.error('  3. If SRV is blocked (e.g. firewall): use standard URI in Atlas (Connect -> Drivers -> see "Connection string only").');
      console.error('');
      console.error('To use local MongoDB instead, in .env set:');
      console.error('  MONGO_URI=mongodb://localhost:27017/green-space-optimizer');
      console.error('  (Install MongoDB Community Server if not installed.)');
    }
    process.exit(1);
  }
};

module.exports = connectDB;



// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ MongoDB connected");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
