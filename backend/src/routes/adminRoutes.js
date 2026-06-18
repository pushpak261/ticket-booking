const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');
const { createTheater } = require('../controllers/theaterController');
const { createShowtime, deleteShowtime } = require('../controllers/showtimeController');
const { getAllBookings } = require('../controllers/bookingController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// Movie management
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// Theater management
router.post('/theaters', createTheater);

// Showtime management
router.post('/showtimes', createShowtime);
router.delete('/showtimes/:id', deleteShowtime);

// Booking management
router.get('/bookings', getAllBookings);

module.exports = router;
