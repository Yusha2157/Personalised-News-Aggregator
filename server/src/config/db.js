import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  
  // For development without MongoDB, use in-memory database
  if (!mongoUri || mongoUri.includes('localhost')) {
    console.log('⚠️  Running in development mode without MongoDB');
    console.log('📝 To use real database, install MongoDB and update MONGODB_URI in .env');
    console.log('🚀 Server will start with mock data for demonstration');
    return;
  }
  
  mongoose.set('strictQuery', true);
  
  try {
    await mongoose.connect(mongoUri, {
      // Connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Retry configuration
      retryWrites: true,
      retryReads: true
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Continuing with development mode...');
  }
}


