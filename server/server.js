const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = require('./models');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/doctors', require('./routes/doctor.routes'));
app.use('/api/slots', require('./routes/slot.routes'));
app.use('/api/admin', require('./routes/admin.routes'));      // ← ADDED
// app.use('/api/appointments', require('./routes/appointment.routes')); // coming next


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server — connect to DB first, then listen
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db.sequelize.authenticate(); // just TEST the connection, don't sync
    console.log('✅ Database connected successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1); // stop the server if DB fails
  }
};

startServer();