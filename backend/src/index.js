const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const trainerRoutes = require('./routes/trainers');
const memberRoutes = require('./routes/members');
const scheduleRoutes = require('./routes/schedule');
const subscriptionRoutes = require('./routes/subscriptions');
const evaluationRoutes = require('./routes/evaluations');
const eventRoutes = require('./routes/events');
const goalRoutes = require('./routes/goals');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true
}));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'rubygym-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/goals', goalRoutes);

module.exports = app;
