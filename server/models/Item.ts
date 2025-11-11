import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  _id: string;
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

const ItemSchema = new Schema<IItem>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    imageUrl: String,
    contactName: String,
    contactPhone: String,
    contactEmail: String,
    aiTags: Schema.Types.Mixed,
    embedding: Schema.Types.Mixed,
    isResolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    _id: false,
  }
);

ItemSchema.index({ userId: 1 });
ItemSchema.index({ status: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ createdAt: -1 });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
