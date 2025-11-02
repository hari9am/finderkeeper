import {
  users,
  items,
  messages,
  notifications,
  type User,
  type UpsertUser,
  type Item,
  type InsertItem,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, like, sql } from "drizzle-orm";
import crypto from "node:crypto";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserKarma(id: string, points: number): Promise<User | undefined>;

  // Item operations
  createItem(item: InsertItem): Promise<Item>;
  getItem(id: string): Promise<Item | undefined>;
  getItems(filters?: { status?: string; category?: string; userId?: string }): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
  updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<void>;
  deleteAllItems(): Promise<void>;
  getUserItems(userId: string): Promise<Item[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<any[]>;
  markMessageAsRead(id: string): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Prefer existing user by email so email acts as the stable key for accounts
    if (userData.email) {
      const existingByEmail = await this.getUserByEmail(userData.email);
      if (existingByEmail) {
        await db
          .update(users)
          .set({
            email: userData.email ?? existingByEmail.email,
            firstName: userData.firstName ?? existingByEmail.firstName,
            lastName: userData.lastName ?? existingByEmail.lastName,
            profileImageUrl: userData.profileImageUrl ?? existingByEmail.profileImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingByEmail.id));

        const [updated] = await db.select().from(users).where(eq(users.id, existingByEmail.id));
        return updated!;
      }
    }

    // Otherwise insert new user using provided id (e.g., OIDC subject)
    await db
      .insert(users)
      .values(userData)
      .onDuplicateKeyUpdate({
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      });
    const [user] = await db.select().from(users).where(eq(users.id, userData.id as string));
    return user!;
  }

  async updateUserKarma(id: string, points: number): Promise<User | undefined> {
    // Perform atomic increment without relying on unsupported MySQL returning()
    const existing = await this.getUser(id);
    if (!existing) return undefined;

    await db
      .update(users)
      .set({ karmaPoints: sql`${users.karmaPoints} + ${points}`, updatedAt: new Date() })
      .where(eq(users.id, id));

    const [updated] = await db.select().from(users).where(eq(users.id, id));
    return updated;
  }

  // Item operations
  async createItem(itemData: InsertItem): Promise<Item> {
    const id = itemData.id as string | undefined;
    let createdId = id;
    if (!createdId) {
      // generate in app if not provided to read back
      createdId = crypto.randomUUID();
    }
    await db.insert(items).values({ ...itemData, id: createdId });
    const [item] = await db.select().from(items).where(eq(items.id, createdId));
    return item!;
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async getItems(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<Item[]> {
    let query = db.select().from(items).orderBy(desc(items.createdAt));

    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(items.status, filters.status));
    }
    if (filters?.category) {
      conditions.push(eq(items.category, filters.category));
    }
    if (filters?.userId) {
      conditions.push(eq(items.userId, filters.userId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  }

  async searchItems(query: string): Promise<Item[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(items)
      .where(
        or(
          like(items.title, searchPattern),
          like(items.description, searchPattern),
          like(items.location, searchPattern)
        )
      )
      .orderBy(desc(items.createdAt));
  }

  async updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined> {
    await db
      .update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(items.id, id));
    const [updated] = await db.select().from(items).where(eq(items.id, id));
    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async deleteAllItems(): Promise<void> {
    await db.delete(items);
  }

  async getUserItems(userId: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(eq(items.userId, userId))
      .orderBy(desc(items.createdAt));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = messageData.id as string | undefined;
    let createdId = id;
    if (!createdId) createdId = crypto.randomUUID();
    await db.insert(messages).values({ ...messageData, id: createdId });
    const [message] = await db.select().from(messages).where(eq(messages.id, createdId));
    return message!;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    const conversations = new Map();
    for (const msg of userMessages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, msg);
      }
    }

    return Array.from(conversations.values());
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = notificationData.id as string | undefined;
    let createdId = id;
    if (!createdId) createdId = crypto.randomUUID();
    await db.insert(notifications).values({ ...notificationData, id: createdId });
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, createdId));
    return notification!;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
