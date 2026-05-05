import dotenv from 'dotenv';
import { connectToMongoDB } from './mongodb.js';
import { User } from './models/User.js';
import { Item } from './models/Item.js';
import { Message } from './models/Message.js';
import { Notification } from './models/Notification.js';
import { Session } from './models/Session.js';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB connection and collections...\n');
  
  try {
    // Test connection
    await connectToMongoDB();
    console.log('✅ MongoDB connection successful\n');
    
    // Test collections by accessing them
    const collections = [
      { name: 'users', model: User },
      { name: 'items', model: Item },
      { name: 'messages', model: Message },
      { name: 'notifications', model: Notification },
      { name: 'sessions', model: Session }
    ];
    
    console.log('📋 Verifying collections:');
    for (const collection of collections) {
      try {
        // Try to count documents to verify collection exists
        const count = await collection.model.countDocuments();
        console.log(`  ✅ ${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`  ❌ ${collection.name}: Error - ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Required Collections:');
    console.log('  - users (user profiles, karma points, etc.)');
    console.log('  - items (lost and found items with details)');
    console.log('  - messages (user-to-user communications)');
    console.log('  - notifications (system notifications)');
    console.log('  - sessions (user session data)');
    
  } catch (error) {
    console.error('❌ Database test failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
