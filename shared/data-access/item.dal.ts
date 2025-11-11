import { Db, ObjectId } from 'mongodb';
import { connectToDatabase } from '../mongodb';

export interface Item {
  _id?: ObjectId;
  id?: string;
  userId: ObjectId | string;
  title: string;
  description: string;
  category: string;
  status: 'lost' | 'found';
  location: string;
  date: Date;
  imageUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  aiTags?: string[];
  embedding?: number[];
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const ItemDAL = {
  async create(itemData: Omit<Item, '_id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    const itemToInsert = {
      ...itemData,
      userId: typeof itemData.userId === 'string' ? new ObjectId(itemData.userId) : itemData.userId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('items').insertOne(itemToInsert);

    return {
      ...itemToInsert,
      _id: result.insertedId,
      id: result.insertedId.toString(),
    };
  },

  async findById(id: string | ObjectId): Promise<Item | null> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const item = await db.collection('items').findOne({ _id });
    
    if (!item) return null;
    
    return {
      ...item,
      id: item._id.toString(),
      userId: item.userId.toString(),
    } as Item;
  },

  async findByUserId(userId: string | ObjectId): Promise<Item[]> {
    const { db } = await connectToDatabase();
    const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const items = await db.collection('items')
      .find({ userId: _userId })
      .sort({ createdAt: -1 })
      .toArray();

    return items.map(item => ({
      ...item,
      id: item._id.toString(),
      userId: item.userId.toString(),
    })) as Item[];
  },

  async search(query: string, filters: {
    category?: string;
    status?: 'lost' | 'found';
    location?: string;
    dateRange?: { start: Date; end: Date };
  } = {}): Promise<Item[]> {
    const { db } = await connectToDatabase();
    
    const searchFilter: any = {};
    
    // Text search
    if (query) {
      searchFilter.$text = { $search: query };
    }
    
    // Apply filters
    if (filters.category) {
      searchFilter.category = filters.category;
    }
    
    if (filters.status) {
      searchFilter.status = filters.status;
    }
    
    if (filters.location) {
      searchFilter.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters.dateRange) {
      searchFilter.date = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end,
      };
    }
    
    const items = await db.collection('items')
      .find(searchFilter)
      .sort({ createdAt: -1 })
      .toArray();

    return items.map(item => ({
      ...item,
      id: item._id.toString(),
      userId: item.userId.toString(),
    })) as Item[];
  },

  async update(
    id: string | ObjectId,
    updates: Partial<Omit<Item, '_id' | 'id' | 'userId' | 'createdAt'>>
  ): Promise<Item | null> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await db.collection('items').findOneAndUpdate(
      { _id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    
    return {
      ...result,
      id: result._id.toString(),
      userId: result.userId.toString(),
    } as Item;
  },

  async markAsResolved(id: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await db.collection('items').updateOne(
      { _id },
      {
        $set: {
          isResolved: true,
          updatedAt: new Date(),
        },
      }
    );
    
    return result.modifiedCount > 0;
  },

  async delete(id: string | ObjectId): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await db.collection('items').deleteOne({ _id });
    return result.deletedCount > 0;
  },
};
