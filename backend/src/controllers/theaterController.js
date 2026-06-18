const Theater = require('../models/Theater');

/**
 * @desc    Get all theaters (optionally filter by city)
 * @route   GET /api/theaters
 * @access  Public
 */
const getTheaters = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = city ? { city: { $regex: city, $options: 'i' } } : {};

    const theaters = await Theater.find(filter).sort({ name: 1 });

    res.status(200).json({ success: true, data: theaters });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single theater by ID
 * @route   GET /api/theaters/:id
 * @access  Public
 */
const getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    res.status(200).json({ success: true, data: theater });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new theater
 * @route   POST /api/admin/theaters
 * @access  Private/Admin
 */
const createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, data: theater });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of unique cities that have theaters
 * @route   GET /api/theaters/cities
 * @access  Public
 */
const getCities = async (req, res, next) => {
  try {
    const cities = await Theater.distinct('city');
    res.status(200).json({ success: true, data: cities.sort() });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTheaters, getTheaterById, createTheater, getCities };
