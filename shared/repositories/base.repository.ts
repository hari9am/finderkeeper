import { Db, Collection, ObjectId, Filter, WithId, Document } from 'mongodb';
import { z } from 'zod';

type BaseDocument = {
  _id?: ObjectId;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export abstract class BaseRepository<T extends BaseDocument> {
  protected collection: Collection<Document>;
  protected collectionName: string;
  protected schema: z.ZodSchema<T>;

  constructor(db: Db, collectionName: string, schema: z.ZodSchema<T>) {
    this.collection = db.collection(collectionName);
    this.collectionName = collectionName;
    this.schema = schema;
  }

  protected toDomain(doc: WithId<Document> | null): T | null {
    if (!doc) return null;
    
    // Convert ObjectId to string for the domain model
    const { _id, ...rest } = doc;
    return {
      ...rest,
      id: _id.toString(),
      _id: _id, // Keep _id for MongoDB operations
    } as unknown as T;
  }

  protected toMongoDoc(data: Partial<T>): any {
    // Remove id field and use _id instead for MongoDB
    const { id, ...rest } = data as any;
    const doc = {
      ...rest,
      ...(id && { _id: new ObjectId(id) })
    };
    
    return this.schema.parse(doc);
  }

  async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const doc = {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Partial<T>;

    const validatedData = this.toMongoDoc(doc);
    const result = await this.collection.insertOne(validatedData);
    
    return this.toDomain({ ...validatedData, _id: result.insertedId }) as T;
  }

  async findOne(filter: Filter<Document> = {}): Promise<T | null> {
    const doc = await this.collection.findOne(filter);
    return this.toDomain(doc);
  }

  async findById(id: string | ObjectId): Promise<T | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const doc = await this.collection.findOne({ _id } as Filter<Document>);
    return this.toDomain(doc);
  }

  async find(filter: Filter<Document> = {}): Promise<T[]> {
    const cursor = this.collection.find(filter);
    const docs = await cursor.toArray();
    return docs.map(doc => this.toDomain(doc) as T);
  }

  async update(
    id: string | ObjectId,
    updates: Partial<Omit<T, 'id' | '_id' | 'createdAt'>>,
  ): Promise<T | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const updateDoc = {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    };
    
    const result = await this.collection.findOneAndUpdate(
      { _id } as Filter<Document>,
      updateDoc,
      { returnDocument: 'after' }
    );
    
    return this.toDomain(result);
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.collection.deleteOne({ _id } as Filter<Document>);
    return result.deletedCount > 0;
  }

  async count(filter: Filter<Document> = {}): Promise<number> {
    return this.collection.countDocuments(filter);
  }
}
