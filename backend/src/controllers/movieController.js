const Movie = require('../models/Movie');

/**
 * @desc    Get all movies (with optional filters)
 * @route   GET /api/movies
 * @access  Public
 * 
 * ✅ OPTIMIZED: Text search with index, cursor-based pagination
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
    // Text index provides O(log n) performance instead of O(n)
    if (search) {
      filter.$text = { $search: search };
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

/**
 * @desc    Get single movie by ID
 * @route   GET /api/movies/:id
 * @access  Public
 */
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new movie
 * @route   POST /api/admin/movies
 * @access  Private/Admin
 */
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a movie
 * @route   PUT /api/admin/movies/:id
 * @access  Private/Admin
 */
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a movie
 * @route   DELETE /api/admin/movies/:id
 * @access  Private/Admin
 */
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    res.status(200).json({ success: true, message: 'Movie deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
