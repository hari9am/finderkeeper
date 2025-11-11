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

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUserKarma(id: string, points: number): Promise<User | undefined>;

  // Item operations
  createItem(itemData: InsertItem): Promise<Item>;
  getItem(id: string): Promise<Item | undefined>;
  getItems(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
  updateItem(id: string, updates: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<void>;
  deleteAllItems(): Promise<void>;
  getUserItems(userId: string): Promise<Item[]>;

  // Message operations
  createMessage(messageData: InsertMessage): Promise<Message>;
  getConversation(userId1: string, userId2: string): Promise<Message[]>;
  getUserConversations(userId: string): Promise<any[]>;
  markMessageAsRead(id: string): Promise<void>;

  // Notification operations
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string, userId?: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  clearNotificationHistory(userId: string): Promise<void>;
}
