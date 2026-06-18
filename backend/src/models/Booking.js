const mongoose = require('mongoose');

/**
 * Booking Schema
 * Records a confirmed ticket purchase by a user for a specific showtime.
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      // Auto-generated readable booking reference
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: [true, 'Showtime reference is required'],
    },
    seats: {
      type: [String], // e.g. ["A1", "A2"]
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one seat must be selected',
      },
    },
    seatType: {
      type: String,
      enum: ['regular', 'premium', 'recliner'],
      default: 'regular',
    },
    pricePerSeat: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid', // Simulated payment — always paid on booking
    },
    // Snapshot of movie/theater details at booking time (for history)
    snapshot: {
      movieTitle: String,
      theaterName: String,
      city: String,
      showDate: String,
      showTime: String,
      screenName: String,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Middleware: Generate booking ID before saving ────────────────────────────
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    // Format: CB-XXXXXX (6 uppercase alphanumeric characters)
    this.bookingId = 'CB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// ✅ Indexes for optimal performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ showtime: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingId: 1 }, { unique: true });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
