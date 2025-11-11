import { Db, Filter } from 'mongodb';
import { userSchema, User } from '../../shared/mongodb-schema';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<User> {
  constructor(db: Db) {
    super(db, 'users', userSchema as any);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as any);
  }

  async incrementKarma(userId: string, points: number): Promise<User | null> {
    return this.update(userId, {
      $inc: { karmaPoints: points },
      $currentDate: { updatedAt: true }
    } as any);
  }

  // Add any other user-specific methods here
  async searchUsers(query: string): Promise<User[]> {
    const filter = {
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };
    return this.find(filter);
  }
}
