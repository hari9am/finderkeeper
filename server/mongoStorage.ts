import {
  type User,
  type UpsertUser,
  type Item,
  type InsertItem,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { User as UserModel } from "./models/User";
import { Item as ItemModel } from "./models/Item";
import { Message as MessageModel } from "./models/Message";
import { Notification as NotificationModel } from "./models/Notification";
import { connectToMongoDB } from "./mongodb";
import crypto from "node:crypto";
import type { IStorage } from "./storage";
import { MemoryStorage } from "./memoryStorage";
import mongoose from "mongoose";

export class MongoStorage implements IStorage {
  private connectionPromise: Promise<void>;

  constructor() {
    // Ensure MongoDB connection is established
    this.connectionPromise = connectToMongoDB();
  }

  private async ensureConnection(): Promise<void> {
    await this.connectionPromise;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    if (!user) return undefined;
    return this.mapMongoUser(user);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return undefined;
    return this.mapMongoUser(user);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Prefer existing user by email so email acts as the stable key for accounts
    if (userData.email) {
      const existingByEmail = await this.getUserByEmail(userData.email);
      if (existingByEmail) {
        const updated = await UserModel.findByIdAndUpdate(
          existingByEmail.id,
          {
            email: userData.email ?? existingByEmail.email,
            firstName: userData.firstName ?? existingByEmail.firstName,
            lastName: userData.lastName ?? existingByEmail.lastName,
            phone: userData.phone ?? existingByEmail.phone,
            profileImageUrl: userData.profileImageUrl ?? existingByEmail.profileImageUrl,
          },
          { new: true }
        ).lean();
        return this.mapMongoUser(updated!);
      }
    }

    // Otherwise insert new user using provided id (e.g., OIDC subject)
    const userId = userData.id || crypto.randomUUID();
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        _id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        profileImageUrl: userData.profileImageUrl,
        karmaPoints: userData.karmaPoints ?? 0,
      },
      { upsert: true, new: true }
    ).lean();
    return this.mapMongoUser(user!);
  }

  async updateUserKarma(id: string, points: number): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { karmaPoints: points } },
      { new: true }
    ).lean();
    if (!user) return undefined;
    return this.mapMongoUser(user);
  }

  // Item operations
  async createItem(itemData: InsertItem): Promise<Item> {
    const id = itemData.id || crypto.randomUUID();
    const item = await ItemModel.create({
      _id: id,
      userId: itemData.userId,
      title: itemData.title,
      description: itemData.description,
      category: itemData.category,
      status: itemData.status,
      location: itemData.location,
      date: itemData.date,
      imageUrl: itemData.imageUrl,
      contactName: itemData.contactName,
      contactPhone: itemData.contactPhone,
      contactEmail: itemData.contactEmail,
      aiTags: itemData.aiTags,
      embedding: itemData.embedding,
      isResolved: itemData.isResolved ?? false,
    });
    return this.mapMongoItem(item.toObject());
  }

  async getItem(id: string): Promise<Item | undefined> {
    const item = await ItemModel.findById(id).lean();
    if (!item) return undefined;
    return this.mapMongoItem(item);
  }

  async getItems(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<Item[]> {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.category) query.category = filters.category;
    if (filters?.userId) query.userId = filters.userId;

    const items = await ItemModel.find(query).sort({ createdAt: -1 }).lean();
    return items.map(item => this.mapMongoItem(item));
  }

  async searchItems(query: string): Promise<Item[]> {
    const searchRegex = new RegExp(query, 'i');
    const items = await ItemModel.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
    return items.map(item => this.mapMongoItem(item));
  }

  async updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined> {
    const item = await ItemModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!item) return undefined;
    return this.mapMongoItem(item);
  }

  async deleteItem(id: string): Promise<void> {
    await ItemModel.findByIdAndDelete(id);
  }

  async deleteAllItems(): Promise<void> {
    await ItemModel.deleteMany({});
  }

  async getUserItems(userId: string): Promise<Item[]> {
    const items = await ItemModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return items.map(item => this.mapMongoItem(item));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = messageData.id || crypto.randomUUID();
    const message = await MessageModel.create({
      _id: id,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      itemId: messageData.itemId,
      content: messageData.content,
      isRead: messageData.isRead ?? false,
    });
    return this.mapMongoMessage(message.toObject());
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    const messages = await MessageModel.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
    return messages.map(msg => this.mapMongoMessage(msg));
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const messages = await MessageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const conversations = new Map();
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, this.mapMongoMessage(msg));
      }
    }

    return Array.from(conversations.values());
  }

  async markMessageAsRead(id: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(id, { isRead: true });
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = notificationData.id || crypto.randomUUID();
    const notification = await NotificationModel.create({
      _id: id,
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      itemId: notificationData.itemId,
      isRead: notificationData.isRead ?? false,
    });
    return this.mapMongoNotification(notification.toObject());
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return notifications.map(notif => this.mapMongoNotification(notif));
  }

  async markNotificationAsRead(id: string, userId?: string): Promise<void> {
    const filter: any = { _id: id };
    if (userId) {
      filter.userId = userId;
    }
    await NotificationModel.findOneAndUpdate(filter, { isRead: true });
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({ userId, isRead: false });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
  }

  async clearNotificationHistory(userId: string): Promise<void> {
    await NotificationModel.deleteMany({ userId });
  }

  // Helper methods to map MongoDB documents to schema types
  private mapMongoUser(user: any): User {
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      karmaPoints: user.karmaPoints,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapMongoItem(item: any): Item {
    return {
      id: item._id,
      userId: item.userId,
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      location: item.location,
      date: item.date,
      imageUrl: item.imageUrl,
      contactName: item.contactName,
      contactPhone: item.contactPhone,
      contactEmail: item.contactEmail,
      aiTags: item.aiTags,
      embedding: item.embedding,
      isResolved: item.isResolved,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapMongoMessage(message: any): Message {
    return {
      id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      itemId: message.itemId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };
  }

  private mapMongoNotification(notification: any): Notification {
    return {
      id: notification._id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      itemId: notification.itemId,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}

let _storage: MongoStorage | MemoryStorage | null = null;

export function getStorage(): MongoStorage | MemoryStorage {
  if (!_storage) {
    // Use MongoDB if connected, otherwise fallback to memory storage
    if (mongoose.connection.readyState === 1) {
      _storage = new MongoStorage();
    } else {
      _storage = new MemoryStorage();
    }
  }
  return _storage;
}

// For backward compatibility
export const storage = new Proxy({} as MongoStorage | MemoryStorage, {
  get(target, prop) {
    return getStorage()[prop as keyof (MongoStorage | MemoryStorage)];
  }
});
