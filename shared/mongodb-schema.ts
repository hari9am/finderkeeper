import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Base schema for common fields
const baseSchema = {
  _id: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
};

// User Schema
export const userSchema = z.object({
  ...baseSchema,
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  karmaPoints: z.number().int().default(0)
});

export type User = z.infer<typeof userSchema>;

// Item Schema
export const itemSchema = z.object({
  ...baseSchema,
  userId: z.instanceof(ObjectId),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: z.enum(['lost', 'found']),
  location: z.string(),
  date: z.date(),
  imageUrl: z.string().url().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  aiTags: z.array(z.string()).optional(),
  embedding: z.array(z.number()).optional(),
  isResolved: z.boolean().default(false)
});

export type Item = z.infer<typeof itemSchema>;

// Message Schema
export const messageSchema = z.object({
  ...baseSchema,
  senderId: z.instanceof(ObjectId),
  receiverId: z.instanceof(ObjectId),
  itemId: z.instanceof(ObjectId).optional(),
  content: z.string(),
  isRead: z.boolean().default(false)
});

export type Message = z.infer<typeof messageSchema>;

// Notification Schema
export const notificationSchema = z.object({
  ...baseSchema,
  userId: z.instanceof(ObjectId),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  itemId: z.instanceof(ObjectId).optional(),
  isRead: z.boolean().default(false)
});

export type Notification = z.infer<typeof notificationSchema>;
