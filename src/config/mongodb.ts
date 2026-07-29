import mongoose from 'mongoose';
import ConfigService from './service';

export async function connectToDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!ConfigService.database.mongoUri) {
    console.warn('⚠ MongoDB URI is not configured; continuing without database persistence');
    return false;
  }

  try {
    await mongoose.connect(ConfigService.database.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: 'carepolicy-ai'
    });

    console.log('✓ Connected to MongoDB Atlas');
    return true;
  } catch (error) {
    console.warn('⚠ MongoDB connection unavailable; continuing without database persistence:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB Atlas');
  } catch (error) {
    console.error('✗ MongoDB disconnect failed:', error instanceof Error ? error.message : String(error));
  }
}

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
