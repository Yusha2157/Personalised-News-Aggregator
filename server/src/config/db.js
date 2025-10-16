/**
 * Database configuration and connection management
 * MongoDB connection with Mongoose ODM
 */

import mongoose from 'mongoose';
import { logger } from './logger.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-aggregator';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connection options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
};

// Enable debug mode in development
if (NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

/**
 * Connect to MongoDB database
 */
export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info('Database already connected');
      return mongoose.connection;
    }

    await mongoose.connect(MONGODB_URI, options);
    
    logger.info(`Connected to MongoDB: ${MONGODB_URI.split('@')[1] || MONGODB_URI}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}

/**
 * Get database connection status
 */
export function getConnectionStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
}