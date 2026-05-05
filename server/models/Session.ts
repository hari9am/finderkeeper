import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  _id: string;
  userId: string;
  sessionData: any;
  expires: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User' },
    sessionData: { type: Schema.Types.Mixed, required: true },
    expires: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false,
  }
);

SessionSchema.index({ userId: 1 });
SessionSchema.index({ expires: 1 });
SessionSchema.index({ createdAt: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
