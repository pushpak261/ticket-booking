const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process if connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // ✅ Connection pooling for performance
      maxPoolSize: 10,              // Maximum connections in pool
      minPoolSize: 5,               // Minimum connections to maintain
      maxIdleTimeMS: 45000,         // Close idle connections after 45s
      
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
    
    // ✅ Create indexes on startup (idempotent - safe to run multiple times)
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Ensuring all indexes exist...');
      const { createAllIndexes } = require('./createIndexes');
      await createAllIndexes();
    }
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n💡 Fix: Update MONGO_URI in backend/.env file');
    process.exit(1);
  }
};

module.exports = connectDB;
