const Movie = require('../models/Movie');

/**
 * @desc    Get all movies (with optional filters)
 * @route   GET /api/movies
 * @access  Public
 */
const getMovies = async (req, res, next) => {
  try {
    const { status, genre, language, search, page = 1, limit = 12 } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (status) filter.status = status;
    if (language) filter.language = language;
    if (genre) filter.genre = { $in: [genre] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Movie.countDocuments(filter);
    const movies = await Movie.find(filter)
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
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
