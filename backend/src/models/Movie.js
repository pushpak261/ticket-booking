const mongoose = require('mongoose');

/**
 * Movie Schema
 * Stores all movie metadata including cast, genre, and release status.
 */
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      enum: [
        'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
        'Romance', 'Thriller', 'Animation', 'Adventure', 'Fantasy',
      ],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Duration is required'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    poster: {
      type: String, // URL to poster image
      required: [true, 'Poster URL is required'],
    },
    trailer: {
      type: String, // YouTube embed URL
    },
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String },
      },
    ],
    director: {
      type: String,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'ended'],
      default: 'coming_soon',
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'S'],
      default: 'UA',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
movieSchema.index({ title: 'text', description: 'text' });

// ✅ Additional indexes for common queries
movieSchema.index({ status: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ language: 1 });
movieSchema.index({ status: 1, releaseDate: -1 });
movieSchema.index({ rating: -1 });

module.exports = mongoose.model('Movie', movieSchema);
