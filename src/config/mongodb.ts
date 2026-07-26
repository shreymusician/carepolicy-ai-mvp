import mongoose from 'mongoose';
import ConfigService from './service';

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(ConfigService.database.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: 'carepolicy-ai'
    });

    console.log('✓ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
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
