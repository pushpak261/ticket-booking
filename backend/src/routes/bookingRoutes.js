const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

const bookingRules = [
  body('showtimeId').notEmpty().withMessage('Showtime ID is required'),
  body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('seatType')
    .isIn(['regular', 'premium', 'recliner'])
    .withMessage('Invalid seat type'),
];

router.post('/', bookingRules, validate, createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);

module.exports = router;
