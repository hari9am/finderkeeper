import { z } from "zod";

// User types
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImageUrl?: string;
  karmaPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImageUrl?: string;
  karmaPoints?: number;
}

export const insertUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  karmaPoints: z.number().default(0).optional(),
});

// Item types
export interface Item {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  date: Date;
  imageUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  aiTags?: any;
  embedding?: any;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertItem {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  date: Date;
  imageUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  aiTags?: any;
  embedding?: any;
  isResolved?: boolean;
}

export const insertItemSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: z.string(),
  location: z.string(),
  date: z.date(),
  imageUrl: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  aiTags: z.any().optional(),
  embedding: z.any().optional(),
  isResolved: z.boolean().default(false).optional(),
});

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  itemId?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface InsertMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  itemId?: string;
  content: string;
  isRead?: boolean;
}

export const insertMessageSchema = z.object({
  id: z.string().optional(),
  senderId: z.string(),
  receiverId: z.string(),
  itemId: z.string().optional(),
  content: z.string(),
  isRead: z.boolean().default(false).optional(),
});

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  itemId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface InsertNotification {
  id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  itemId?: string;
  isRead?: boolean;
}

export const insertNotificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  itemId: z.string().optional(),
  isRead: z.boolean().default(false).optional(),
});
