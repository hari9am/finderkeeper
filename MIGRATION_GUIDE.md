# MySQL to MongoDB Migration Guide

## Overview
This application has been migrated from MySQL to MongoDB. All data storage now uses MongoDB with Mongoose ODM.

## What Changed

### Database Layer
- **Removed**: MySQL with Drizzle ORM
- **Added**: MongoDB with Mongoose ODM
- **Connection**: MongoDB Atlas connection string

### Files Changed
1. **Removed Files**:
   - `server/db.ts` (MySQL connection)
   - `server/storage.ts` (MySQL storage implementation)
   - `server/scripts/` (MySQL-specific scripts)
   - Old `shared/schema.ts` (Drizzle schema)

2. **New Files**:
   - `server/mongodb.ts` (MongoDB connection)
   - `server/mongoStorage.ts` (MongoDB storage implementation)
   - `server/models/User.ts` (Mongoose User model)
   - `server/models/Item.ts` (Mongoose Item model)
   - `server/models/Message.ts` (Mongoose Message model)
   - `server/models/Notification.ts` (Mongoose Notification model)
   - New `shared/schema.ts` (TypeScript interfaces and Zod schemas)

3. **Updated Files**:
   - `server/replitAuth.ts` (Now uses MongoDB session store)
   - `server/routes.ts` (Imports from mongoStorage)
   - `package.json` (Removed MySQL dependencies, kept MongoDB dependencies)

### Dependencies
**Removed**:
- `mysql2`
- `drizzle-orm`
- `drizzle-kit`
- `express-mysql-session`
- `connect-pg-simple`
- `@neondatabase/serverless`

**Kept/Added**:
- `mongoose` (already installed)
- `mongodb` (already installed)
- `connect-mongodb-session` (for session storage)
- `@types/connect-mongodb-session` (TypeScript types)

## Environment Variables

Update your `.env` file with the following:

```env
MONGODB_URI=mongodb+srv://findit:<db_password>@findit.qejydei.mongodb.net/
SESSION_SECRET=your-session-secret-here
```

Replace `<db_password>` with your actual MongoDB password.

## Data Collections

MongoDB collections (equivalent to MySQL tables):
- `users` - User accounts
- `items` - Lost and found items
- `messages` - User messages
- `notifications` - User notifications
- `sessions` - Session storage (managed by connect-mongodb-session)

## Schema Mapping

### Users
- `_id` (String) - User ID (was `id` in MySQL)
- `email` (String, unique) - User email
- `firstName` (String) - First name
- `lastName` (String) - Last name
- `profileImageUrl` (String) - Profile image URL
- `karmaPoints` (Number, default: 0) - Karma points
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

### Items
- `_id` (String) - Item ID
- `userId` (String, ref: User) - Owner user ID
- `title` (String) - Item title
- `description` (String) - Item description
- `category` (String) - Item category
- `status` (String) - "lost" or "found"
- `location` (String) - Location
- `date` (Date) - Date lost/found
- `imageUrl` (String) - Image URL
- `contactName` (String) - Contact name
- `contactPhone` (String) - Contact phone
- `contactEmail` (String) - Contact email
- `aiTags` (Mixed) - AI-generated tags
- `embedding` (Mixed) - AI embedding vector
- `isResolved` (Boolean, default: false) - Resolution status
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

### Messages
- `_id` (String) - Message ID
- `senderId` (String, ref: User) - Sender user ID
- `receiverId` (String, ref: User) - Receiver user ID
- `itemId` (String, ref: Item) - Related item ID
- `content` (String) - Message content
- `isRead` (Boolean, default: false) - Read status
- `createdAt` (Date) - Creation timestamp

### Notifications
- `_id` (String) - Notification ID
- `userId` (String, ref: User) - User ID
- `type` (String) - Notification type
- `title` (String) - Notification title
- `message` (String) - Notification message
- `itemId` (String, ref: Item) - Related item ID
- `isRead` (Boolean, default: false) - Read status
- `createdAt` (Date) - Creation timestamp

## Running the Application

1. Ensure MongoDB URI is set in your `.env` file
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`

The application will automatically connect to MongoDB on startup.

## Notes

- All IDs are now strings (UUID format) instead of auto-incrementing integers
- MongoDB uses `_id` internally, but the application maps it to `id` for consistency
- Timestamps are automatically managed by Mongoose
- Session data is now stored in MongoDB instead of MySQL
- All CRUD operations remain the same from the API perspective
