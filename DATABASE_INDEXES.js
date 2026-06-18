/**
 * DATABASE INDEXES CONFIGURATION
 * 
 * Run this file to create all recommended indexes:
 * node backend/src/config/createIndexes.js
 * 
 * Indexes are crucial for query performance
 * Each index can improve query performance by 10-100x
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
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n📚 Creating indexes...\n');

    // ─── USER INDEXES ───────────────────────────────────────────────────────
    console.log('👤 User Indexes:');
    
    // Unique index on email - ✅ CRITICAL for login/register
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('  ✅ email (unique, sparse)');
    
    // Index on role for admin queries
    await User.collection.createIndex({ role: 1 });
    console.log('  ✅ role');
    
    // TTL index for password reset tokens (if implemented)
    await User.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
    console.log('  ✅ createdAt (TTL: 30 days)');

    // ─── MOVIE INDEXES ──────────────────────────────────────────────────────
    console.log('\n🎬 Movie Indexes:');
    
    // ✅ Text index for search - already in schema but confirming
    await Movie.collection.createIndex({ title: 'text', description: 'text' });
    console.log('  ✅ title, description (text index)');
    
    // Index on status for filtering
    await Movie.collection.createIndex({ status: 1 });
    console.log('  ✅ status');
    
    // Index on genre
    await Movie.collection.createIndex({ genre: 1 });
    console.log('  ✅ genre');
    
    // Index on language
    await Movie.collection.createIndex({ language: 1 });
    console.log('  ✅ language');
    
    // Compound index for common filters
    await Movie.collection.createIndex({ status: 1, releaseDate: -1 });
    console.log('  ✅ status, releaseDate (compound)');
    
    // Index on rating for sorting
    await Movie.collection.createIndex({ rating: -1 });
    console.log('  ✅ rating (descending)');

    // ─── THEATER INDEXES ────────────────────────────────────────────────────
    console.log('\n🎪 Theater Indexes:');
    
    // Index on city - ✅ CRITICAL for city filtering
    await Theater.collection.createIndex({ city: 1 });
    console.log('  ✅ city');
    
    // Index on name
    await Theater.collection.createIndex({ name: 1 });
    console.log('  ✅ name');
    
    // Compound index for common queries
    await Theater.collection.createIndex({ city: 1, name: 1 });
    console.log('  ✅ city, name (compound)');

    // ─── SHOWTIME INDEXES ───────────────────────────────────────────────────
    console.log('\n⏰ Showtime Indexes:');
    
    // Index on movie for filtering
    await Showtime.collection.createIndex({ movie: 1 });
    console.log('  ✅ movie');
    
    // Index on theater for filtering
    await Showtime.collection.createIndex({ theater: 1 });
    console.log('  ✅ theater');
    
    // Index on date for filtering and sorting
    await Showtime.collection.createIndex({ date: 1 });
    console.log('  ✅ date');
    
    // Index on isActive status
    await Showtime.collection.createIndex({ isActive: 1 });
    console.log('  ✅ isActive');
    
    // ✅ CRITICAL Compound indexes for common query patterns
    await Showtime.collection.createIndex({ 
      isActive: 1, 
      movie: 1, 
      date: 1 
    });
    console.log('  ✅ isActive, movie, date (compound)');
    
    await Showtime.collection.createIndex({ 
      isActive: 1, 
      theater: 1, 
      date: 1 
    });
    console.log('  ✅ isActive, theater, date (compound)');
    
    await Showtime.collection.createIndex({ 
      date: 1, 
      startTime: 1 
    });
    console.log('  ✅ date, startTime (compound)');

    // ─── BOOKING INDEXES ────────────────────────────────────────────────────
    console.log('\n🎫 Booking Indexes:');
    
    // Index on user - ✅ CRITICAL for fetching user bookings
    await Booking.collection.createIndex({ user: 1 });
    console.log('  ✅ user');
    
    // Index on showtime
    await Booking.collection.createIndex({ showtime: 1 });
    console.log('  ✅ showtime');
    
    // Compound index for user bookings sorted by date
    await Booking.collection.createIndex({ 
      user: 1, 
      createdAt: -1 
    });
    console.log('  ✅ user, createdAt (compound)');
    
    // Index on status for filtering
    await Booking.collection.createIndex({ status: 1 });
    console.log('  ✅ status');
    
    // Index on bookingId for lookup
    await Booking.collection.createIndex({ bookingId: 1 }, { unique: true });
    console.log('  ✅ bookingId (unique)');
    
    // Compound for admin dashboard queries
    await Booking.collection.createIndex({ 
      status: 1, 
      createdAt: -1 
    });
    console.log('  ✅ status, createdAt (compound)');

    console.log('\n✅ All indexes created successfully!\n');
    
    // Display index stats
    await displayIndexStats();

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    process.exit(1);
  }
};

/**
 * Display statistics about created indexes
 */
const displayIndexStats = async () => {
  console.log('📊 Index Statistics:\n');
  
  const collections = [
    { name: 'User', model: User },
    { name: 'Movie', model: Movie },
    { name: 'Theater', model: Theater },
    { name: 'Showtime', model: Showtime },
    { name: 'Booking', model: Booking },
  ];
  
  for (const { name, model } of collections) {
    const indexes = await model.collection.getIndexes();
    console.log(`${name}:`);
    Object.keys(indexes).forEach(key => {
      console.log(`  - ${JSON.stringify(indexes[key].key)}`);
    });
    console.log();
  }
};

// Run if executed directly
if (require.main === module) {
  createAllIndexes();
}

module.exports = { createAllIndexes };

// ═════════════════════════════════════════════════════════════════════════════
// USAGE IN app.js - AUTO-CREATE INDEXES ON STARTUP
// ═════════════════════════════════════════════════════════════════════════════

/*
// In backend/src/config/db.js, add after successful connection:

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // ... options ...
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // ✅ Create indexes on startup (idempotent - safe to run multiple times)
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Ensuring all indexes exist...');
      const { createAllIndexes } = require('./createIndexes');
      await createAllIndexes();
    }
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
*/

// ═════════════════════════════════════════════════════════════════════════════
// INDEX PERFORMANCE GUIDE
// ═════════════════════════════════════════════════════════════════════════════

/*
INDEX SELECTION STRATEGY:

1. **Single Field Indexes** - For common queries on specific field
   - Query: Theater.find({ city: "Mumbai" })
   - Index: { city: 1 }
   - Impact: O(n) → O(log n)

2. **Compound Indexes** - For multi-field filters
   - Query: Showtime.find({ isActive: true, movie: movieId, date: { $gte: now } })
   - Index: { isActive: 1, movie: 1, date: 1 }
   - Impact: O(n) → O(log n)
   
3. **Text Indexes** - For full-text search
   - Query: Movie.find({ $text: { $search: "Interstellar" } })
   - Index: { title: 'text', description: 'text' }
   - Impact: O(n) → O(log n), plus relevance scoring

4. **Unique Indexes** - For uniqueness + query optimization
   - Query: User.findOne({ email: "user@example.com" })
   - Index: { email: 1 }, unique: true
   - Impact: O(n) → O(log n), prevents duplicates

5. **TTL Indexes** - For automatic document expiration
   - Use: Session tokens, password reset links
   - Index: { createdAt: 1 }, expireAfterSeconds: 3600
   - Impact: Automatic cleanup

INDEX RULES:

✅ DO:
- Create indexes for frequently searched fields
- Use compound indexes for common multi-field queries
- Use indexes with equality, range, then sort order
- Monitor index usage in production

❌ DON'T:
- Create indexes for every field (increases insert/update time)
- Use indexes for small collections (<1000 documents)
- Ignore the "Equality, Range, Sort" rule for compound indexes
- Forget to test index performance with real data

MONITORING:
- Use db.collection.stats() to see index size
- Use explain() to see query execution plan
- Monitor slow queries in production logs

*/
