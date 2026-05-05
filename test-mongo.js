import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://farmconnect:Cham8497%40@findit.qejydei.mongodb.net/finderskeepers?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');

mongoose.connect(MONGODB_URI, {
  dbName: 'finderskeepers',
  ssl: true,
  tls: true,
  tlsInsecure: false,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
