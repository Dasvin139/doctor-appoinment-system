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

// Database sync
db.sequelize
  .sync({ alter: true }) // alter: true updates table structure if model changes
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((err) => {
    console.error('Database sync error:', err);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});