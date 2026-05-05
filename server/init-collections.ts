import dotenv from 'dotenv';
import { connectToMongoDB } from './mongodb.js';
import { User } from './models/User.js';
import { Item } from './models/Item.js';
import { Message } from './models/Message.js';
import { Notification } from './models/Notification.js';
import { Session } from './models/Session.js';

// Load environment variables
dotenv.config();

async function initializeCollections() {
  console.log('🔧 Initializing MongoDB collections...\n');
  
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Create collections by inserting and deleting a dummy document
    const collections = [
      { name: 'users', model: User },
      { name: 'items', model: Item },
      { name: 'messages', model: Message },
      { name: 'notifications', model: Notification },
      { name: 'sessions', model: Session }
    ];
    
    console.log('📋 Creating collections:');
    for (const collection of collections) {
      try {
        // Check if collection exists by trying to count documents
        const count = await collection.model.countDocuments();
        console.log(`  ✅ ${collection.name}: Collection exists (${count} documents)`);
      } catch (error) {
        // If collection doesn't exist, create it by inserting a dummy document
        console.log(`  🔧 ${collection.name}: Creating collection...`);
        
        try {
          // Create a dummy document and immediately delete it
          const dummy = await collection.model.create({});
          await collection.model.findByIdAndDelete(dummy._id);
          console.log(`  ✅ ${collection.name}: Collection created`);
        } catch (createError) {
          console.log(`  ⚠️ ${collection.name}: ${createError.message}`);
        }
      }
    }
    
    console.log('\n🎉 Collections initialization complete!');
    console.log('\n📝 Created Collections:');
    console.log('  - users (user profiles, karma points, etc.)');
    console.log('  - items (lost and found items with details)');
    console.log('  - messages (user-to-user communications)');
    console.log('  - notifications (system notifications)');
    console.log('  - sessions (user session data)');
    
    console.log('\n🌐 Refresh your MongoDB Atlas dashboard to see the collections!');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the initialization
initializeCollections().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Initialization failed:', error);
  process.exit(1);
});
