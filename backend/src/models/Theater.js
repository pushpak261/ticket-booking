const mongoose = require('mongoose');

/**
 * Theater Schema
 * Represents a physical cinema with multiple screens.
 */
const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    amenities: {
      type: [String],
      default: [],
      // e.g. ['Dolby Atmos', '4K Projection', 'Recliner Seats', 'Food Court']
    },
    screens: [
      {
        screenNumber: { type: Number, required: true },
        screenName: { type: String, required: true },
        totalSeats: { type: Number, required: true },
        // Seat layout: rows x columns
        rows: { type: Number, required: true },
        columns: { type: Number, required: true },
        screenType: {
          type: String,
          enum: ['Standard', 'IMAX', '4DX', 'Dolby'],
          default: 'Standard',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Theater', theaterSchema);
