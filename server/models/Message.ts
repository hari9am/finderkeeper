import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  senderId: string;
  receiverId: string;
  itemId?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    _id: { type: String, required: true },
    senderId: { type: String, required: true, ref: 'User' },
    receiverId: { type: String, required: true, ref: 'User' },
    itemId: { type: String, ref: 'Item' },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false,
  }
);

MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
