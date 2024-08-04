const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const auth = require('./middleware/auth');

const app = express();

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', auth, require('./routes/records'));
app.use('/api/tokens', auth, require('./routes/tokens'));
app.use('/api/blockchain', require('./routes/blockchain')); // Removed `auth` middleware

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));