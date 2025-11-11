import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImageUrl?: string;
  karmaPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    firstName: String,
    lastName: String,
    phone: String,
    profileImageUrl: String,
    karmaPoints: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
