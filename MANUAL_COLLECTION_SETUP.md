# Manual MongoDB Collection Setup

Since the automatic connection is failing due to authentication, let's create the collections manually in MongoDB Atlas.

## Step 1: Create Collections in MongoDB Atlas

1. **Go to your MongoDB Atlas Dashboard**: https://cloud.mongodb.com/
2. **Navigate to your cluster**: `findit.qejydei.mongodb.net`
3. **Select the `finderskeepers` database**
4. **Click "Create Collection"** for each of the following:

### Collections to Create:

#### 1. Users Collection
- **Collection Name**: `users`
- **No schema required** (MongoDB is schemaless)

#### 2. Items Collection  
- **Collection Name**: `items`
- **No schema required**

#### 3. Messages Collection
- **Collection Name**: `messages`
- **No schema required**

#### 4. Notifications Collection
- **Collection Name**: `notifications`
- **No schema required**

#### 5. Sessions Collection
- **Collection Name**: `sessions`
- **No schema required**

## Step 2: Fix MongoDB Authentication

The issue is likely with your database user credentials. Let's create a new database user:

### Option A: Update Existing User
1. In MongoDB Atlas → **Database Access**
2. Find the `finderskeepers` user
3. **Edit** the user
4. **Set a new password** without special characters (e.g., `Cham8497`)
5. **Ensure** the user has read/write access to `finderskeepers` database

### Option B: Create New User
1. **Add New Database User**
2. **Username**: `finderskeepers`
3. **Password**: `Cham8497` (no special characters)
4. **Database User Privileges**: 
   - Select `readWrite` role on `finderskeepers` database
5. **Click Add User**

## Step 3: Update Your .env File

After updating the password, change your .env file to:

```env
MONGODB_URI=mongodb+srv://finderskeepers:Cham8497@findit.qejydei.mongodb.net/finderskeepers?retryWrites=true&w=majority
```

## Step 4: Check Network Access

1. In MongoDB Atlas → **Network Access**
2. **Add IP Address** if not already added
3. **Option 1**: Add your current IP address
4. **Option 2**: Allow access from anywhere (0.0.0.0/0) - for development only

## Step 5: Test Connection

After making these changes:

```bash
npm run db:push
```

## Step 6: Start the Application

```bash
npm run dev
```

## Collection Schema Reference

Once collections are created, they will automatically use these schemas:

### Users Collection Schema
```javascript
{
  _id: string,           // User ID
  email?: string,        // Email (unique)
  firstName?: string,    // First name
  lastName?: string,     // Last name
  phone?: string,        // Phone number
  profileImageUrl?: string, // Profile picture
  karmaPoints: number,   // Default: 0
  createdAt: Date,       // Auto-generated
  updatedAt: Date        // Auto-generated
}
```

### Items Collection Schema
```javascript
{
  _id: string,           // Item ID
  userId: string,        // Owner user ID
  title: string,         // Item title
  description: string,   // Item description
  category: string,      // Item category
  status: string,        // "lost" or "found"
  location: string,      // Location
  date: Date,           // Date lost/found
  imageUrl?: string,     // Item image
  contactName?: string,  // Contact name
  contactPhone?: string, // Contact phone
  contactEmail?: string, // Contact email
  aiTags?: any,         // AI tags
  embedding?: any,      // Search embeddings
  isResolved: boolean,   // Default: false
  createdAt: Date,       // Auto-generated
  updatedAt: Date        // Auto-generated
}
```

### Messages Collection Schema
```javascript
{
  _id: string,           // Message ID
  senderId: string,      // Sender user ID
  receiverId: string,    // Receiver user ID
  itemId?: string,       // Related item ID
  content: string,       // Message content
  isRead: boolean,       // Default: false
  createdAt: Date        // Auto-generated
}
```

### Notifications Collection Schema
```javascript
{
  _id: string,           // Notification ID
  userId: string,        // Target user ID
  type: string,          // Notification type
  title: string,         // Notification title
  message: string,       // Notification message
  itemId?: string,       // Related item ID
  isRead: boolean,       // Default: false
  createdAt: Date        // Auto-generated
}
```

### Sessions Collection Schema
```javascript
{
  _id: string,           // Session ID
  userId: string,        // User ID
  sessionData: any,      // Session data
  expires: Date,         // Expiration date
  createdAt: Date        // Auto-generated
}
```

## Quick Checklist

- [ ] Create 5 collections in MongoDB Atlas
- [ ] Update database user password (no special characters)
- [ ] Update .env file with new password
- [ ] Check IP whitelist
- [ ] Test with `npm run db:push`
- [ ] Start app with `npm run dev`

## Alternative: Use MongoDB Compass

You can also use MongoDB Compass (GUI tool) to connect and create collections:

1. Download MongoDB Compass
2. Connect with your URI
3. Navigate to `finderskeepers` database
4. Right-click → Create Collection for each collection name

Once you complete these steps, your application will connect properly and all collections will be ready!
