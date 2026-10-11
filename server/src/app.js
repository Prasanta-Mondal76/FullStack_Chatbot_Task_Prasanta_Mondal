const express = require('express');
const cors = require('cors');
const enquiryRoutes = require('./routes/enquiries');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// CORS restricted to the frontend origin (configurable via env).
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

// JSON body parsing with a sane size limit.
app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'DroneTV Assistant API is running' });
});

// Enquiry routes
app.use('/api/enquiries', enquiryRoutes);

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
