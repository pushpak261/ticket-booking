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
 * Create all indexes for optimal performance
 */
const createAllIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n📚 Creating indexes...\n');

    // ─── USER INDEXES ───────────────────────────────────────────────────────
    console.log('👤 User Indexes:');
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('  ✅ email (unique, sparse)');
    await User.collection.createIndex({ role: 1 });
    console.log('  ✅ role');

    // ─── MOVIE INDEXES ──────────────────────────────────────────────────────
    console.log('\n🎬 Movie Indexes:');
    await Movie.collection.createIndex({ title: 'text', description: 'text' });
    console.log('  ✅ title, description (text index)');
    await Movie.collection.createIndex({ status: 1 });
    console.log('  ✅ status');
    await Movie.collection.createIndex({ genre: 1 });
    console.log('  ✅ genre');
    await Movie.collection.createIndex({ language: 1 });
    console.log('  ✅ language');
    await Movie.collection.createIndex({ status: 1, releaseDate: -1 });
    console.log('  ✅ status, releaseDate (compound)');
    await Movie.collection.createIndex({ rating: -1 });
    console.log('  ✅ rating (descending)');

    // ─── THEATER INDEXES ────────────────────────────────────────────────────
    console.log('\n🎪 Theater Indexes:');
    await Theater.collection.createIndex({ city: 1 });
    console.log('  ✅ city');
    await Theater.collection.createIndex({ name: 1 });
    console.log('  ✅ name');
    await Theater.collection.createIndex({ city: 1, name: 1 });
    console.log('  ✅ city, name (compound)');

    // ─── SHOWTIME INDEXES ───────────────────────────────────────────────────
    console.log('\n⏰ Showtime Indexes:');
    await Showtime.collection.createIndex({ movie: 1 });
    console.log('  ✅ movie');
    await Showtime.collection.createIndex({ theater: 1 });
    console.log('  ✅ theater');
    await Showtime.collection.createIndex({ date: 1 });
    console.log('  ✅ date');
    await Showtime.collection.createIndex({ isActive: 1 });
    console.log('  ✅ isActive');
    await Showtime.collection.createIndex({ isActive: 1, movie: 1, date: 1 });
    console.log('  ✅ isActive, movie, date (compound)');
    await Showtime.collection.createIndex({ isActive: 1, theater: 1, date: 1 });
    console.log('  ✅ isActive, theater, date (compound)');
    await Showtime.collection.createIndex({ date: 1, startTime: 1 });
    console.log('  ✅ date, startTime (compound)');

    // ─── BOOKING INDEXES ────────────────────────────────────────────────────
    console.log('\n🎫 Booking Indexes:');
    await Booking.collection.createIndex({ user: 1 });
    console.log('  ✅ user');
    await Booking.collection.createIndex({ showtime: 1 });
    console.log('  ✅ showtime');
    await Booking.collection.createIndex({ user: 1, createdAt: -1 });
    console.log('  ✅ user, createdAt (compound)');
    await Booking.collection.createIndex({ status: 1 });
    console.log('  ✅ status');
    await Booking.collection.createIndex({ bookingId: 1 }, { unique: true });
    console.log('  ✅ bookingId (unique)');
    await Booking.collection.createIndex({ status: 1, createdAt: -1 });
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
