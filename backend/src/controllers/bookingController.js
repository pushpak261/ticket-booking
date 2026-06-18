const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const mongoose = require('mongoose');

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 * 
 * ✅ OPTIMIZED: Set-based seat check, atomic transaction
 */
const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { showtimeId, seats, seatType } = req.body;

    // 1. Fetch the showtime with session
    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) {
      throw new Error('Showtime not found.');
    }

    // 2. Check if showtime is in the past
    const showDateTime = new Date(showtime.date);
    if (showDateTime < new Date()) {
      throw new Error('Cannot book a past showtime.');
    }

    // ✅ OPTIMIZATION #1: Use Set for O(1) seat lookup instead of O(n·m)
    const bookedSeatsSet = new Set(showtime.bookedSeats);
    const conflictingSeats = seats.filter((seat) => bookedSeatsSet.has(seat));

    if (conflictingSeats.length > 0) {
      throw new Error(`Seats already booked: ${conflictingSeats.join(', ')}`);
    }

    // 3. Calculate price based on seat type
    const priceMap = {
      regular: showtime.price.regular,
      premium: showtime.price.premium,
      recliner: showtime.price.recliner,
    };
    const pricePerSeat = priceMap[seatType] || showtime.price.regular;
    const totalPrice = pricePerSeat * seats.length;

    // 4. Populate theater/movie details for snapshot
    await showtime.populate('movie', 'title');
    await showtime.populate('theater', 'name city screens');

    const screen = showtime.theater.screens.find(
      (s) => s.screenNumber === showtime.screenNumber
    );

    // 5. Create booking with data snapshot
    const booking = await Booking.create(
      [{
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
      }],
      { session }
    );

    // 6. ✅ OPTIMIZATION #2: Atomic update in same transaction
    await Showtime.findByIdAndUpdate(
      showtimeId,
      { $push: { bookedSeats: { $each: seats } } },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ success: true, data: booking[0] });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
 * 
 * ✅ OPTIMIZED: Atomic transaction to prevent race conditions
 */
const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.user.toString() !== req.user.id) {
      throw new Error('Not authorized.');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled.');
    }

    // ✅ OPTIMIZATION: All updates in single transaction (atomic)
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save({ session });

    await Showtime.findByIdAndUpdate(
      booking.showtime,
      { $pull: { bookedSeats: { $in: booking.seats } } },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({ 
      success: true, 
      message: 'Booking cancelled successfully.', 
      data: booking 
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get all bookings (Admin only)
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 * 
 * ✅ OPTIMIZED: Single aggregation instead of 3000+ N+1 queries
 */
const getAllBookings = async (req, res, next) => {
  try {
    // Single aggregation query instead of 3000+ individual queries
    const bookings = await Booking.aggregate([
      {
        $match: { status: 'confirmed' }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtime',
          foreignField: '_id',
          as: 'showtimeDetails'
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'showtimeDetails.movie',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      {
        $lookup: {
          from: 'theaters',
          localField: 'showtimeDetails.theater',
          foreignField: '_id',
          as: 'theaterDetails'
        }
      },
      {
        $project: {
          _id: 1,
          bookingId: 1,
          seats: 1,
          seatType: 1,
          totalPrice: 1,
          status: 1,
          paymentStatus: 1,
          createdAt: 1,
          'userDetails._id': 1,
          'userDetails.name': 1,
          'userDetails.email': 1,
          'showtimeDetails.date': 1,
          'showtimeDetails.startTime': 1,
          'showtimeDetails.screenNumber': 1,
          'movieDetails._id': 1,
          'movieDetails.title': 1,
          'theaterDetails.name': 1,
          'theaterDetails.city': 1,
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({ 
      success: true, 
      count: bookings.length, 
      data: bookings 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings };
