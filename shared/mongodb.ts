import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finderskeepers';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable');
}

let cachedClient: MongoClient;
let cachedDb: Db;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('items').createIndex({ userId: 1 });
  await db.collection('items').createIndex({ location: '2dsphere' });
  await db.collection('messages').createIndex({ senderId: 1, receiverId: 1 });
  await db.collection('notifications').createIndex({ userId: 1, isRead: 1 });

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function withDatabase(handler: (db: Db) => Promise<any>) {
  const { db } = await connectToDatabase();
  return handler(db);
}
