// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const { startScheduler } = require('./scheduler');



// const app = express();

// connectDB();
// startScheduler();


// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// app.get('/health', (req, res) => {
//   res.json({ status: 'Backend running' });
// });

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/drives', require('./routes/drives'));
// app.use('/api/locations', require('./routes/locations'));
// app.use('/api/incharges', require('./routes/incharges'));
// app.use('/api/scoring', require('./routes/scoring'));
// app.use('/api/ai', require('./routes/ai'));
// app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/community', require('./routes/community'));
// app.use('/api/clustering', require('./routes/clustering'));

// // 404 for API routes - always JSON (no next, so only runs when no route matched)
// app.use('/api', (req, res, next) => {
//   res.status(404).json({ message: 'Not found' });
// });

// // Global error handler - always JSON
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ message: err.message || 'Server error' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// gpt reccomented code 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startScheduler } = require('./scheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend running' });
});

// Connect services
connectDB();
startScheduler();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/drives', require('./routes/drives'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/incharges', require('./routes/incharges'));
app.use('/api/scoring', require('./routes/scoring'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/community', require('./routes/community'));
app.use('/api/clustering', require('./routes/clustering'));
app.use('/api/ai-poll', require('./routes/aiPoll'));
app.use('/api/polls', require('./routes/polls'));

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
