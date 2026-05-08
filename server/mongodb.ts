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

  const MONGODB_URI = process.env.MONGODB_URI?.trim();
  console.log(`📡 MONGODB_URI (trimmed) starts with: ${MONGODB_URI?.substring(0, 15)}... (Length: ${MONGODB_URI?.length})`);

  try {
    // For MongoDB Atlas, use authSource and proper SSL configuration
    const connectionOptions: mongoose.ConnectOptions = {
      dbName: 'finderskeepers',
      ssl: true,
      tls: true,
      tlsInsecure: false,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000
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
