import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function simpleConnectionTest() {
  console.log('🔍 Simple MongoDB Connection Test\n');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('📡 Attempting to connect to MongoDB...');
  console.log(`📍 URI: ${process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@')}\n`);
  
  try {
    // Simple connection without additional options
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!\n');
    
    // Get database info
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('\n📋 Existing collections:');
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    } else {
      console.log('\n📝 No collections found yet. They will be created when you add data.');
    }
    
    console.log('\n🎉 Connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      if (error.message.includes('Authentication failed')) {
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check username and password in MongoDB Atlas');
        console.error('   2. Ensure user has read/write access to finderskeepers database');
        console.error('   3. Verify IP address is whitelisted in Network Access');
        console.error('   4. Try updating password without special characters');
      }
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
simpleConnectionTest();
