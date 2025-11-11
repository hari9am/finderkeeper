import { Db, ObjectId } from 'mongodb';
import { connectToDatabase } from '../mongodb';

export interface Notification {
  _id?: ObjectId;
  id?: string;
  userId: ObjectId | string;
  type: string;
  title: string;
  message: string;
  itemId?: ObjectId | string | null;
  isRead: boolean;
  createdAt: Date;
}

export const NotificationDAL = {
  async create(notificationData: Omit<Notification, '_id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    const notificationToInsert = {
      ...notificationData,
      userId: typeof notificationData.userId === 'string' ? new ObjectId(notificationData.userId) : notificationData.userId,
      itemId: notificationData.itemId ? (typeof notificationData.itemId === 'string' ? new ObjectId(notificationData.itemId) : notificationData.itemId) : null,
      isRead: false,
      createdAt: now,
    };

    const result = await db.collection('notifications').insertOne(notificationToInsert);

    return {
      ...notificationToInsert,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    };
  },

  async findById(id: string | ObjectId): Promise<Notification | null> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const notification = await db.collection('notifications').findOne({ _id });
    
    if (!notification) return null;
    
    return {
      ...notification,
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      itemId: notification.itemId ? notification.itemId.toString() : null,
    } as Notification;
  },

  async findByUserId(userId: string | ObjectId, options: { unreadOnly?: boolean } = {}): Promise<Notification[]> {
    const { db } = await connectToDatabase();
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const filter: any = { userId: _userId };
    
    if (options.unreadOnly) {
      filter.isRead = false;
    }
    
    const notifications = await db.collection('notifications')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return notifications.map(notification => ({
      ...notification,
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      itemId: notification.itemId ? notification.itemId.toString() : null,
    })) as Notification[];
  },

  async markAsRead(notificationId: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _id = typeof notificationId === 'string' ? new ObjectId(notificationId) : notificationId;
    
    const result = await db.collection('notifications').updateOne(
      { _id },
      {
        $set: {
          isRead: true,
        },
      }
    );
    
    return result.modifiedCount > 0;
  },

  async markAllAsRead(userId: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await db.collection('notifications').updateMany(
      { 
        userId: _userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );
    
    return result.modifiedCount > 0;
  },

  async getUnreadCount(userId: string | ObjectId): Promise<number> {
    const { db } = await connectToDatabase();
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    return db.collection('notifications').countDocuments({
      userId: _userId,
      isRead: false,
    });
  },

  async delete(notificationId: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _id = typeof notificationId === 'string' ? new ObjectId(notificationId) : notificationId;
    
    const result = await db.collection('notifications').deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async deleteByUserId(userId: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await db.collection('notifications').deleteMany({ userId: _userId });
    return result.deletedCount > 0;
  },
};
