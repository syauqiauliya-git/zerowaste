// src/db/connect.js

import mongoose from 'mongoose';

/**
 * Establishes connection to the MongoDB database.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('❌ FATAL: DATABASE_URL is not defined in environment variables.'); 
  }

  try {
    // Note: Mongoose 6+ deprecates most options, making the connect call cleaner.
    await mongoose.connect(dbUrl);

    console.log('🔗 Database connection successful! Host:', mongoose.connection.host);
  } catch (err) {
    console.error('❌ Database connection failed. Details:', err.message);
    // Throw error so the server startup logic catches it and exits cleanly
    throw err;
  }
};

export default connectDB;