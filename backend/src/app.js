const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Route imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theaterRoutes = require('./routes/theaterRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware imports
const { errorHandler, notFound } = require('./middleware/errorHandler');
const getCorsOptions = require('./middleware/corsConfig');
const securityHeaders = require('./middleware/securityHeaders');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
// Security headers
app.use(securityHeaders);

// CORS with environment-specific configuration
app.use(cors(getCorsOptions()));

app.use(express.json());           // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CineBook API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);       // 404 handler for undefined routes
app.use(errorHandler);   // Global error handler

module.exports = app;
