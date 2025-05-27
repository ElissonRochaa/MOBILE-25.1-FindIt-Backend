import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  type: 'private' | 'group';
  name?: string;
  lastMessage?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
    },
    name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IConversation>('Conversation', ConversationSchema);