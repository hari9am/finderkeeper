import type {
  User,
  UpsertUser,
  Item,
  InsertItem,
  Message,
  InsertMessage,
  Notification,
  InsertNotification,
} from "@shared/schema";
import crypto from "crypto";
import type { IStorage } from "./storage";

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private items: Map<string, Item> = new Map();
  private messages: Map<string, Message> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    console.log("🧠 Using in-memory storage (development mode)");
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersByEmail.get(email);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user exists by email first
    if (userData.email) {
      const existingByEmail = this.usersByEmail.get(userData.email);
      if (existingByEmail) {
        const updated: User = {
          ...existingByEmail,
          email: userData.email ?? existingByEmail.email,
          firstName: userData.firstName ?? existingByEmail.firstName,
          lastName: userData.lastName ?? existingByEmail.lastName,
          phone: userData.phone ?? existingByEmail.phone,
          profileImageUrl: userData.profileImageUrl ?? existingByEmail.profileImageUrl,
          updatedAt: new Date(),
        };
        this.users.set(updated.id, updated);
        this.usersByEmail.set(updated.email!, updated);
        return updated;
      }
    }

    const userId = userData.id || crypto.randomUUID();
    const user: User = {
      id: userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      profileImageUrl: userData.profileImageUrl,
      karmaPoints: userData.karmaPoints ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(userId, user);
    if (user.email) {
      this.usersByEmail.set(user.email, user);
    }
    return user;
  }

  async updateUserKarma(id: string, points: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated: User = {
      ...user,
      karmaPoints: user.karmaPoints + points,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    if (updated.email) {
      this.usersByEmail.set(updated.email, updated);
    }
    return updated;
  }

  // Item operations
  async createItem(itemData: InsertItem): Promise<Item> {
    const id = itemData.id || crypto.randomUUID();
    const item: Item = {
      id,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.set(id, item);
    return item;
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async getItems(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<Item[]> {
    let items = Array.from(this.items.values());

    if (filters?.status) {
      items = items.filter(item => item.status === filters.status);
    }
    if (filters?.category) {
      items = items.filter(item => item.category === filters.category);
    }
    if (filters?.userId) {
      items = items.filter(item => item.userId === filters.userId);
    }

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async searchItems(query: string): Promise<Item[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.items.values()).filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.location.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }

  async updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updated: Item = {
      ...item,
      ...updates,
      id: item.id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    this.items.delete(id);
  }

  async deleteAllItems(): Promise<void> {
    this.items.clear();
  }

  async getUserItems(userId: string): Promise<Item[]> {
    return this.getItems({ userId });
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = messageData.id || crypto.randomUUID();
    const message: Message = {
      id,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      itemId: messageData.itemId,
      content: messageData.content,
      isRead: messageData.isRead ?? false,
      createdAt: new Date(),
    };

    this.messages.set(id, message);
    return message;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const userMessages = Array.from(this.messages.values())
      .filter(msg => msg.senderId === userId || msg.receiverId === userId);

    const conversations = new Map();
    for (const msg of userMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(otherUserId) || 
          conversations.get(otherUserId).createdAt < msg.createdAt) {
        conversations.set(otherUserId, msg);
      }
    }

    return Array.from(conversations.values());
  }

  async markMessageAsRead(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      this.messages.set(id, { ...message, isRead: true });
    }
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = notificationData.id || crypto.randomUUID();
    const notification: Notification = {
      id,
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      itemId: notificationData.itemId,
      isRead: notificationData.isRead ?? false,
      createdAt: new Date(),
    };

    this.notifications.set(id, notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: string, userId?: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification && (!userId || notification.userId === userId)) {
      this.notifications.set(id, { ...notification, isRead: true });
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId && !notif.isRead)
      .length;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true });
      }
    }
  }

  async clearNotificationHistory(userId: string): Promise<void> {
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.userId === userId) {
        this.notifications.delete(id);
      }
    }
  }
}
