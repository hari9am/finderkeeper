import mongoose from 'mongoose';

let isConnected = false;

export async function connectToMongoDB() {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not set. Running without database connection.");
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    // For MongoDB Atlas, use authSource and proper SSL configuration
    const connectionOptions = {
      dbName: 'finderskeepers',
      ssl: true,
      tls: true,
      tlsInsecure: false,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(MONGODB_URI, connectionOptions);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️ Continuing without database connection. Some features may not work.');
    // Don't throw error to allow server to start without DB
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

export { mongoose };
