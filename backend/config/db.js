/**
 * MongoDB Atlas Connection Manager
 * Provides connection pooling, event listeners, and live connection health diagnostics.
 */

const mongoose = require('mongoose');

// Configure Mongoose options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
  socketTimeoutMS: 45000,
};

/**
 * Connect to MongoDB Atlas or local MongoDB instance
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[DATABASE WARNING] MONGODB_URI is not defined in environment variables.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, mongooseOptions);
    console.log(`[DATABASE] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`[DATABASE ERROR] Connection failed: ${error.message}`);
    // Do not terminate process in development; allows offline testing and live reconnection attempts
    return false;
  }
};

// Monitor Connection Lifecycle Events
mongoose.connection.on('connected', () => {
  console.log('[DATABASE EVENT] Mongoose connected to MongoDB cluster.');
});

mongoose.connection.on('error', (err) => {
  console.error('[DATABASE EVENT] Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[DATABASE EVENT] Mongoose connection disconnected.');
});

// Graceful process termination
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('[DATABASE] Mongoose connection closed through app termination.');
  }
  process.exit(0);
});

/**
 * Returns real-time database connection metrics for health check and Network Monitor
 */
const getDBStatus = () => {
  const stateCodes = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  const state = mongoose.connection.readyState;

  return {
    isConnected: state === 1,
    readyState: state,
    status: stateCodes[state] || 'UNKNOWN',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    modelsLoaded: Object.keys(mongoose.models).length
  };
};

module.exports = {
  connectDB,
  getDBStatus
};
