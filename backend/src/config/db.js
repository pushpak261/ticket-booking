const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process if connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n💡 Fix: Update MONGO_URI in backend/.env file');
    process.exit(1);
  }
};

module.exports = connectDB;
