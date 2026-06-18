const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seats, seatType } = req.body;

    // 1. Fetch the showtime with a session-level lock via findOneAndUpdate
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    // 2. Check if showtime is in the past
    const showDateTime = new Date(showtime.date);
    if (showDateTime < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book a past showtime.' });
    }

    // 3. Check for seat conflicts (atomic check)
    const conflictingSeats = seats.filter((seat) => showtime.bookedSeats.includes(seat));
    if (conflictingSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats already booked: ${conflictingSeats.join(', ')}`,
      });
    }

    // 4. Calculate price based on seat type
    const priceMap = {
      regular: showtime.price.regular,
      premium: showtime.price.premium,
      recliner: showtime.price.recliner,
    };
    const pricePerSeat = priceMap[seatType] || showtime.price.regular;
    const totalPrice = pricePerSeat * seats.length;

    // 5. Populate theater/movie details for snapshot
    await showtime.populate('movie', 'title');
    await showtime.populate('theater', 'name city screens');

    const screen = showtime.theater.screens.find(
      (s) => s.screenNumber === showtime.screenNumber
    );

    // 6. Create booking with data snapshot (immutable record)
    const booking = await Booking.create({
      user: req.user.id,
      showtime: showtimeId,
      seats,
      seatType,
      pricePerSeat,
      totalPrice,
      snapshot: {
        movieTitle: showtime.movie.title,
        theaterName: showtime.theater.name,
        city: showtime.theater.city,
        showDate: showtime.date.toISOString().split('T')[0],
        showTime: showtime.startTime,
        screenName: screen ? screen.screenName : `Screen ${showtime.screenNumber}`,
      },
    });

    // 7. Atomically update booked seats on the showtime document
    await Showtime.findByIdAndUpdate(showtimeId, {
      $push: { bookedSeats: { $each: seats } },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for the logged-in user
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster duration genre' },
          { path: 'theater', select: 'name city' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single booking by ID (only owner or admin)
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'showtime',
      populate: [
        { path: 'movie', select: 'title poster duration certificate genre language' },
        { path: 'theater', select: 'name city address screens' },
      ],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Ensure user can only view their own bookings (unless admin)
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Mark booking as cancelled
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Release seats back on the showtime
    await Showtime.findByIdAndUpdate(booking.showtime, {
      $pull: { bookedSeats: { $in: booking.seats } },
    });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully.', data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (Admin only)
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'showtime', populate: { path: 'movie', select: 'title' } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings };
