import { Db, ObjectId } from 'mongodb';
import { connectToDatabase } from '../mongodb';

export interface Message {
  _id?: ObjectId;
  id?: string;
  senderId: ObjectId | string;
  receiverId: ObjectId | string;
  itemId?: ObjectId | string | null;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export const MessageDAL = {
  async create(messageData: Omit<Message, '_id' | 'createdAt' | 'isRead'>): Promise<Message> {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    const messageToInsert = {
      ...messageData,
      senderId: typeof messageData.senderId === 'string' ? new ObjectId(messageData.senderId) : messageData.senderId,
      receiverId: typeof messageData.receiverId === 'string' ? new ObjectId(messageData.receiverId) : messageData.receiverId,
      itemId: messageData.itemId ? (typeof messageData.itemId === 'string' ? new ObjectId(messageData.itemId) : messageData.itemId) : null,
      isRead: false,
      createdAt: now,
    };

    const result = await db.collection('messages').insertOne(messageToInsert);

    return {
      ...messageToInsert,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    };
  },

  async findById(id: string | ObjectId): Promise<Message | null> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const message = await db.collection('messages').findOne({ _id });
    
    if (!message) return null;
    
    return {
      ...message,
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      itemId: message.itemId ? message.itemId.toString() : null,
    } as Message;
  },

  async findByConversation(
    userId1: string | ObjectId,
    userId2: string | ObjectId,
    itemId?: string | ObjectId | null
  ): Promise<Message[]> {
    const { db } = await connectToDatabase();
    const _userId1 = typeof userId1 === 'string' ? new ObjectId(userId1) : userId1;
    const _userId2 = typeof userId2 === 'string' ? new ObjectId(userId2) : userId2;
    
    const filter: any = {
      $or: [
        { senderId: _userId1, receiverId: _userId2 },
        { senderId: _userId2, receiverId: _userId1 },
      ]
    };
    
    if (itemId) {
      const _itemId = typeof itemId === 'string' ? new ObjectId(itemId) : itemId;
      filter.itemId = _itemId;
    }
    
    const messages = await db.collection('messages')
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();

    return messages.map(message => ({
      ...message,
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      itemId: message.itemId ? message.itemId.toString() : null,
    })) as Message[];
  },

  async findByUser(userId: string | ObjectId): Promise<Message[]> {
    const { db } = await connectToDatabase();
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const messages = await db.collection('messages')
      .find({
        $or: [
          { senderId: _userId },
          { receiverId: _userId },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return messages.map(message => ({
      ...message,
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      itemId: message.itemId ? message.itemId.toString() : null,
    })) as Message[];
  },

  async markAsRead(messageId: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _id = typeof messageId === 'string' ? new ObjectId(messageId) : messageId;
    
    const result = await db.collection('messages').updateOne(
      { _id },
      {
        $set: {
          isRead: true,
        },
      }
    );
    
    return result.modifiedCount > 0;
  },

  async markConversationAsRead(
    senderId: string | ObjectId,
    receiverId: string | ObjectId,
    itemId?: string | ObjectId | null
  ): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _senderId = typeof senderId === 'string' ? new ObjectId(senderId) : senderId;
    const _receiverId = typeof receiverId === 'string' ? new ObjectId(receiverId) : receiverId;
    
    const filter: any = {
      senderId: _senderId,
      receiverId: _receiverId,
      isRead: false,
    };
    
    if (itemId) {
      const _itemId = typeof itemId === 'string' ? new ObjectId(itemId) : itemId;
      filter.itemId = _itemId;
    }
    
    const result = await db.collection('messages').updateMany(
      filter,
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
    
    return db.collection('messages').countDocuments({
      receiverId: _userId,
      isRead: false,
    });
  },

  async delete(messageId: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _id = typeof messageId === 'string' ? new ObjectId(messageId) : messageId;
    
    const result = await db.collection('messages').deleteOne({ _id });
    return result.deletedCount > 0;
  },
};
