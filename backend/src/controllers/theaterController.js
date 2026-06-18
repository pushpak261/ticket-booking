const Theater = require('../models/Theater');
const cache = require('../utils/cacheService');

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
    
    // ✅ OPTIMIZATION: Invalidate cities cache when new theater is added
    cache.invalidate('all_cities');
    
    res.status(201).json({ success: true, data: theater });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of unique cities that have theaters
 * @route   GET /api/theaters/cities
 * @access  Public
 * 
 * ✅ OPTIMIZED: In-memory caching with 5-minute TTL
 */
const getCities = async (req, res, next) => {
  try {
    const CACHE_KEY = 'all_cities';
    
    // Check cache first: O(1)
    let cities = cache.get(CACHE_KEY);
    
    if (!cities) {
      // Query database only if not cached: O(n)
      cities = await Theater.distinct('city');
      cities.sort();
      
      // Store in cache for 5 minutes (300000 ms)
      cache.set(CACHE_KEY, cities, 300000);
    }
    
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTheaters, getTheaterById, createTheater, getCities };
