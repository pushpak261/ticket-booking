const mongoose = require('mongoose');

/**
 * Showtime Schema
 * Links a movie to a specific screen and time slot.
 * Tracks which seats have been booked to prevent conflicts.
 */
const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater reference is required'],
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
    },
    date: {
      type: Date,
      required: [true, 'Show date is required'],
    },
    startTime: {
      type: String, // e.g. "10:30 AM"
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // Calculated from movie duration
    },
    price: {
      regular: { type: Number, required: true, default: 200 },
      premium: { type: Number, required: true, default: 350 },
      recliner: { type: Number, required: true, default: 500 },
    },
    // Array of booked seat labels e.g. ["A1", "A2", "B5"]
    bookedSeats: {
      type: [String],
      default: [],
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: calculate available seats count
showtimeSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.bookedSeats.length;
});

// Ensure virtuals are included in JSON output
showtimeSchema.set('toJSON', { virtuals: true });
showtimeSchema.set('toObject', { virtuals: true });

// ✅ Indexes for optimal performance
showtimeSchema.index({ movie: 1 });
showtimeSchema.index({ theater: 1 });
showtimeSchema.index({ date: 1 });
showtimeSchema.index({ isActive: 1 });
showtimeSchema.index({ isActive: 1, movie: 1, date: 1 });
showtimeSchema.index({ isActive: 1, theater: 1, date: 1 });
showtimeSchema.index({ date: 1, startTime: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);
