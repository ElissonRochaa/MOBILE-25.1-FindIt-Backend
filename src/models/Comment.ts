import mongoose, { Document, Schema } from 'mongoose';

// Interface para tipar o documento do Comentário
export interface IComment extends Document {
  post: mongoose.Schema.Types.ObjectId;
  autor: mongoose.Schema.Types.ObjectId;
  texto: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // Referência ao post ao qual pertence
      required: true,
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referência ao usuário que comentou
      required: true,
    },
    texto: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComment>('Comment', CommentSchema);