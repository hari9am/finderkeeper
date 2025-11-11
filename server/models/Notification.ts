import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  itemId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    itemId: { type: String, ref: 'Item' },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false,
  }
);

NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
