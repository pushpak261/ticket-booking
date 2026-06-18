const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

/**
 * @desc    Get showtimes filtered by movie, theater, and date
 * @route   GET /api/showtimes
 * @access  Public
 */
const getShowtimes = async (req, res, next) => {
  try {
    const { movieId, theaterId, date } = req.query;
    const filter = { isActive: true };

    if (movieId) filter.movie = movieId;
    if (theaterId) filter.theater = theaterId;
    if (date) {
      // Match all showtimes on the given calendar date
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const showtimes = await Showtime.find(filter)
      .populate('movie', 'title poster duration rating genre')
      .populate('theater', 'name city address screens')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, data: showtimes });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single showtime by ID (with full details)
 * @route   GET /api/showtimes/:id
 * @access  Public
 */
const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('theater');

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new showtime
 * @route   POST /api/admin/showtimes
 * @access  Private/Admin
 */
const createShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.create(req.body);
    res.status(201).json({ success: true, data: showtime });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a showtime
 * @route   DELETE /api/admin/showtimes/:id
 * @access  Private/Admin
 */
const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    res.status(200).json({ success: true, message: 'Showtime deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getShowtimes, getShowtimeById, createShowtime, deleteShowtime };
