/**
 * Create All Database Indexes
 * Run this file to create optimized indexes for production
 * node backend/src/config/createIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

/**
 * Helper function to create index with error handling
 */
const createIndexSafe = async (collection, indexSpec, options = {}) => {
  try {
    await collection.createIndex(indexSpec, options);
    return true;
  } catch (error) {
    // Ignore "already exists" errors
    if (error.code === 85 || error.message.includes('already exists')) {
      return false;  // Index already exists
    }
    throw error;  // Re-throw other errors
  }
};

/**
 * Create all indexes for optimal performance
 */
const createAllIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    console.log('\n📚 Creating indexes...\n');

    // ─── USER INDEXES ───────────────────────────────────────────────────────
    console.log('👤 User Indexes:');
    await createIndexSafe(User.collection, { email: 1 }, { unique: true, sparse: true });
    console.log('  ✅ email (unique, sparse)');
    await createIndexSafe(User.collection, { role: 1 });
    console.log('  ✅ role');

    // ─── MOVIE INDEXES ──────────────────────────────────────────────────────
    console.log('\n🎬 Movie Indexes:');
    await createIndexSafe(Movie.collection, { title: 'text', description: 'text' });
    console.log('  ✅ title, description (text index)');
    await createIndexSafe(Movie.collection, { status: 1 });
    console.log('  ✅ status');
    await createIndexSafe(Movie.collection, { genre: 1 });
    console.log('  ✅ genre');
    await createIndexSafe(Movie.collection, { language: 1 });
    console.log('  ✅ language');
    await createIndexSafe(Movie.collection, { status: 1, releaseDate: -1 });
    console.log('  ✅ status, releaseDate (compound)');
    await createIndexSafe(Movie.collection, { rating: -1 });
    console.log('  ✅ rating (descending)');

    // ─── THEATER INDEXES ────────────────────────────────────────────────────
    console.log('\n🎪 Theater Indexes:');
    await createIndexSafe(Theater.collection, { city: 1 });
    console.log('  ✅ city');
    await createIndexSafe(Theater.collection, { name: 1 });
    console.log('  ✅ name');
    await createIndexSafe(Theater.collection, { city: 1, name: 1 });
    console.log('  ✅ city, name (compound)');

    // ─── SHOWTIME INDEXES ───────────────────────────────────────────────────
    console.log('\n⏰ Showtime Indexes:');
    await createIndexSafe(Showtime.collection, { movie: 1 });
    console.log('  ✅ movie');
    await createIndexSafe(Showtime.collection, { theater: 1 });
    console.log('  ✅ theater');
    await createIndexSafe(Showtime.collection, { date: 1 });
    console.log('  ✅ date');
    await createIndexSafe(Showtime.collection, { isActive: 1 });
    console.log('  ✅ isActive');
    await createIndexSafe(Showtime.collection, { isActive: 1, movie: 1, date: 1 });
    console.log('  ✅ isActive, movie, date (compound)');
    await createIndexSafe(Showtime.collection, { isActive: 1, theater: 1, date: 1 });
    console.log('  ✅ isActive, theater, date (compound)');
    await createIndexSafe(Showtime.collection, { date: 1, startTime: 1 });
    console.log('  ✅ date, startTime (compound)');

    // ─── BOOKING INDEXES ────────────────────────────────────────────────────
    console.log('\n🎫 Booking Indexes:');
    await createIndexSafe(Booking.collection, { user: 1 });
    console.log('  ✅ user');
    await createIndexSafe(Booking.collection, { showtime: 1 });
    console.log('  ✅ showtime');
    await createIndexSafe(Booking.collection, { user: 1, createdAt: -1 });
    console.log('  ✅ user, createdAt (compound)');
    await createIndexSafe(Booking.collection, { status: 1 });
    console.log('  ✅ status');
    await createIndexSafe(Booking.collection, { bookingId: 1 }, { unique: true });
    console.log('  ✅ bookingId (unique)');
    await createIndexSafe(Booking.collection, { status: 1, createdAt: -1 });
    console.log('  ✅ status, createdAt (compound)');

    console.log('\n✅ All indexes created successfully!\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  createAllIndexes();
}

module.exports = { createAllIndexes };
