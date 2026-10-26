const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose.
 * Sanitizes connection strings to prevent credential exposure in logs.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reloop';

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true, // Build defined indexes on startup
      serverSelectionTimeoutMS: 5000, // Timeout fast if MongoDB is down
    });

    const host = conn.connection.host;
    const dbName = conn.connection.name;
    const port = conn.connection.port;

    console.log(`[MongoDB] Connected successfully to host: ${host}:${port}, database: ${dbName}`);
    return conn;
  } catch (error) {
    // Log safe error without dumping raw connection URI or auth tokens
    console.error(`[MongoDB Connection Error] Failed to connect: ${error.message}`);
    throw error;
  }
};

/**
 * Helper to inspect current connection readiness
 * ReadyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;
  const isHealthy = stateCode === 1;

  return {
    isHealthy,
    status: states[stateCode] || 'unknown',
    readyState: stateCode,
    database: isHealthy ? mongoose.connection.name : null,
    host: isHealthy ? mongoose.connection.host : null,
    port: isHealthy ? mongoose.connection.port : null,
  };
};

module.exports = {
  connectDB,
  getDbStatus,
};
