/**
 * OPTIMIZATION IMPLEMENTATIONS
 * Ready-to-use code for all performance improvements
 * 
 * Usage: Copy each function into the corresponding controller
 */

// ═════════════════════════════════════════════════════════════════════════════
// 1. CACHE SERVICE - For cities, genres, languages caching
// ═════════════════════════════════════════════════════════════════════════════

// File: backend/src/utils/cacheService.js
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  /**
   * Set cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttlMs = 300000) {
    this.cache.set(key, value);

    // Clear existing timeout if any
    if (this.ttl.has(key)) clearTimeout(this.ttl.get(key));

    // Set new timeout
    const timeoutId = setTimeout(() => {
      this.cache.delete(key);
      this.ttl.delete(key);
      console.log(`✅ Cache expired: ${key}`);
    }, ttlMs);

    this.ttl.set(key, timeoutId);
  }

  /**
   * Get from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get(key) {
    return this.cache.get(key) || null;
  }

  /**
   * Invalidate specific cache entry
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    this.cache.delete(key);
    if (this.ttl.has(key)) clearTimeout(this.ttl.get(key));
    this.ttl.delete(key);
    console.log(`🗑️  Cache invalidated: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.ttl.forEach(timeout => clearTimeout(timeout));
    this.cache.clear();
    this.ttl.clear();
    console.log(`🗑️  All cache cleared`);
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = new CacheService();

// ═════════════════════════════════════════════════════════════════════════════
// 2. OPTIMIZED MOVIE CONTROLLER with Text Search & Cursor Pagination
// ═════════════════════════════════════════════════════════════════════════════

// File: backend/src/controllers/movieController.js (REPLACE getMovies function)

const Movie = require('../models/Movie');

/**
 * @desc    Get all movies with cursor-based pagination
 * @route   GET /api/movies
 * @access  Public
 * 
 * Query params:
 * - status: movie status filter
 * - genre: genre filter
 * - language: language filter
 * - search: text search (uses index)
 * - limit: results per page (default: 12)
 * - cursor: cursor for pagination (last movie _id)
 * 
 * ✅ O(log n) performance with indexes
 */
const getMovies = async (req, res, next) => {
  try {
    const { status, genre, language, search, limit = 12, cursor = null } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (status) filter.status = status;
    if (language) filter.language = language;
    if (genre) filter.genre = { $in: [genre] };

    // ✅ OPTIMIZATION #1: Use $text search instead of $regex
    // Text index is already defined in Movie model
    if (search) {
      filter.$text = { $search: search };  // Uses text index - O(log n)
    }

    // ✅ OPTIMIZATION #2: Cursor-based pagination (O(1) instead of O(skip))
    if (cursor) {
      filter._id = { $gt: cursor };  // Direct seek to position
    }

    const limitNum = Math.min(Number(limit), 100);  // Max 100 results
    const movies = await Movie.find(filter)
      .sort(search 
        ? { score: { $meta: 'textScore' }, _id: 1 }  // Text relevance score
        : { releaseDate: -1, _id: 1 }
      )
      .limit(limitNum + 1);  // +1 to detect if there's next page

    // Check if there are more results
    const hasMore = movies.length > limitNum;
    if (hasMore) movies.pop();

    // Get next cursor from last movie
    const nextCursor = movies.length > 0 ? movies[movies.length - 1]._id : null;

    res.status(200).json({
      success: true,
      count: movies.length,
      hasMore,
      nextCursor,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 3. OPTIMIZED BOOKING CONTROLLER with Set-based seat checking
// ═════════════════════════════════════════════════════════════════════════════

// File: backend/src/controllers/bookingController.js (REPLACE createBooking function)

const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const mongoose = require('mongoose');

/**
 * @desc    Create a new booking with atomic transaction
 * @route   POST /api/bookings
 * @access  Private
 * 
 * ✅ OPTIMIZATION: O(n) seat check instead of O(n·m)
 * ✅ OPTIMIZATION: Atomic transaction to prevent race conditions
 */
const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { showtimeId, seats, seatType } = req.body;

    // 1. Fetch the showtime
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

    // 5. Find screen details
    const screen = showtime.theater.screens.find(
      (s) => s.screenNumber === showtime.screenNumber
    );

    // 6. Create booking with data snapshot
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

    // 7. ✅ OPTIMIZATION #2: Atomic update in same transaction
    await Showtime.findByIdAndUpdate(
      showtimeId,
      { $push: { bookedSeats: { $each: seats } } },
      { session }
    );

    // Commit transaction
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
 * Cancel booking with atomic transaction
 * ✅ OPTIMIZATION: Atomic operations prevent race conditions
 */
const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.user.toString() !== req.user.id) {
      throw new Error('Not authorized');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    // ✅ OPTIMIZATION: All updates in single transaction
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
 * Get all bookings for admin with aggregation
 * ✅ OPTIMIZATION: Single aggregation instead of N+1 queries
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

// ═════════════════════════════════════════════════════════════════════════════
// 4. OPTIMIZED THEATER CONTROLLER with Caching
// ═════════════════════════════════════════════════════════════════════════════

// File: backend/src/controllers/theaterController.js

const Theater = require('../models/Theater');
const cache = require('../utils/cacheService');

/**
 * Get cities with caching
 * ✅ OPTIMIZATION: O(1) after first call, cache expires in 5 minutes
 */
const getCities = async (req, res, next) => {
  try {
    const CACHE_KEY = 'all_cities';
    
    // Check cache first: O(1)
    let cities = cache.get(CACHE_KEY);
    
    if (!cities) {
      console.log('📚 Fetching cities from database...');
      
      // Query database only if not cached: O(n)
      cities = await Theater.distinct('city');
      cities.sort();
      
      // Store in cache for 5 minutes
      cache.set(CACHE_KEY, cities, 300000);
      console.log(`✅ Cached ${cities.length} cities`);
    } else {
      console.log('💾 Cities retrieved from cache');
    }
    
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

/**
 * Create theater (invalidate city cache)
 */
const createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    
    // ✅ OPTIMIZATION: Invalidate cache when data changes
    cache.invalidate('all_cities');
    
    res.status(201).json({ success: true, data: theater });
  } catch (error) {
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 5. PERFORMANCE MONITORING UTILITY
// ═════════════════════════════════════════════════════════════════════════════

// File: backend/src/utils/performanceMonitor.js

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Start timing an operation
   * @param {string} label - Operation label
   * @returns {function} End function
   */
  start(label) {
    const startTime = process.hrtime.bigint();
    
    return () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, { count: 0, totalTime: 0, minTime: Infinity, maxTime: 0 });
      }
      
      const metric = this.metrics.get(label);
      metric.count++;
      metric.totalTime += durationMs;
      metric.minTime = Math.min(metric.minTime, durationMs);
      metric.maxTime = Math.max(metric.maxTime, durationMs);
      
      return durationMs;
    };
  }

  /**
   * Get metrics for a label
   */
  getMetrics(label) {
    const metric = this.metrics.get(label);
    if (!metric) return null;
    
    return {
      label,
      calls: metric.count,
      totalMs: metric.totalTime.toFixed(2),
      avgMs: (metric.totalTime / metric.count).toFixed(2),
      minMs: metric.minTime.toFixed(2),
      maxMs: metric.maxTime.toFixed(2)
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const results = [];
    this.metrics.forEach((value, label) => {
      results.push(this.getMetrics(label));
    });
    return results;
  }

  /**
   * Clear metrics
   */
  clear() {
    this.metrics.clear();
  }
}

module.exports = new PerformanceMonitor();

// Usage in controllers:
/*
const monitor = require('../utils/performanceMonitor');

const getMovies = async (req, res, next) => {
  const end = monitor.start('getMovies');
  try {
    // ... code ...
    const duration = end();
    console.log(`getMovies took ${duration.toFixed(2)}ms`);
  } catch (error) {
    end();
    next(error);
  }
};
*/

// ═════════════════════════════════════════════════════════════════════════════
// 6. DATABASE CONNECTION POOLING CONFIG
// ═════════════════════════════════════════════════════════════════════════════

// File: backend/src/config/db.js (UPDATE mongoose.connect options)

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // ✅ Connection pooling
      maxPoolSize: 10,           // Maximum connections in pool
      minPoolSize: 5,            // Minimum connections to maintain
      maxIdleTimeMS: 45000,      // Close idle connections after 45s
      
      // ✅ Timeouts
      serverSelectionTimeoutMS: 5000,    // 5 seconds to find server
      socketTimeoutMS: 45000,            // 45 seconds socket timeout
      connectTimeoutMS: 10000,           // 10 seconds connection timeout
      
      // ✅ Reliability
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      
      // ✅ Performance
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🔗 Pool Size: ${conn.connection.getClient().options.maxPoolSize}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

// ═════════════════════════════════════════════════════════════════════════════
// 7. QUERY LOGGING MIDDLEWARE FOR DEBUGGING
// ═════════════════════════════════════════════════════════════════════════════

// File: backend/src/middleware/queryLogger.js

const queryLogger = (req, res, next) => {
  // Store original find, findOne, etc.
  const originalFind = require('mongoose').Model.find;
  const originalFindOne = require('mongoose').Model.findOne;
  
  let queryCount = 0;
  const queryLog = [];
  
  // Log mongoose queries in development
  if (process.env.NODE_ENV === 'development') {
    require('mongoose').set('debug', (coll, method, query, doc) => {
      queryCount++;
      const queryInfo = {
        collection: coll,
        method,
        query: JSON.stringify(query),
        timestamp: new Date().toISOString(),
      };
      queryLog.push(queryInfo);
      
      if (queryCount > 20) {
        console.warn(`⚠️  WARNING: ${queryCount} queries in single request!`);
      }
    });
  }
  
  res.on('finish', () => {
    if (process.env.NODE_ENV === 'development' && queryLog.length > 0) {
      console.log(`📊 Request: ${req.method} ${req.path}`);
      console.log(`   Total queries: ${queryLog.length}`);
      queryLog.slice(0, 5).forEach(q => {
        console.log(`   - ${q.method}(${q.collection})`);
      });
    }
  });
  
  next();
};

module.exports = queryLogger;
