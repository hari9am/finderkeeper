import { Db, ObjectId } from 'mongodb';
import { connectToDatabase } from '../mongodb';

export interface User {
  _id?: ObjectId;
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  karmaPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export const UserDAL = {
  async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { db } = await connectToDatabase();
    const now = new Date();
    
    const result = await db.collection('users').insertOne({
      ...userData,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ...userData,
      _id: result.insertedId,
      id: result.insertedId.toString(),
      createdAt: now,
      updatedAt: now,
    };
  },

  async findById(id: string | ObjectId): Promise<User | null> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const user = await db.collection('users').findOne({ _id });
    
    if (!user) return null;
    
    return {
      ...user,
      id: user._id.toString(),
    } as User;
  },

  async findByEmail(email: string): Promise<User | null> {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    
    if (!user) return null;
    
    return {
      ...user,
      id: user._id.toString(),
    } as User;
  },

  async update(
    id: string | ObjectId,
    updates: Partial<Omit<User, '_id' | 'id' | 'createdAt'>>
  ): Promise<User | null> {
    const { db } = await connectToDatabase();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await db.collection('users').findOneAndUpdate(
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
    } as User;
  },

  async incrementKarma(userId: string | ObjectId, points: number): Promise<boolean> {
    const { db } = await connectToDatabase();
    const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const result = await db.collection('users').updateOne(
      { _id },
      {
        $inc: { karmaPoints: points },
        $currentDate: { updatedAt: true },
      }
    );
    
    return result.modifiedCount > 0;
  },

  async search(query: string): Promise<User[]> {
    const { db } = await connectToDatabase();
    const users = await db.collection('users')
      .find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
      .toArray();

    return users.map(user => ({
      ...user,
      id: user._id.toString(),
    })) as User[];
  },
};
