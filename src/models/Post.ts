import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  nomeItem: string;
  descricao: string;
  data: Date; 
  situacao: 'achado' | 'perdido'; 
  fotoUrl?: string; // URL da foto (opcional, após upload)
  usuario: mongoose.Types.ObjectId; // ID do usuário que criou o post
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const PostSchema: Schema = new Schema({
  nomeItem: {
    type: String,
    required: [true, 'O nome do item é obrigatório.'],
    trim: true,
  },
  descricao: {
    type: String,
    required: [true, 'A descrição é obrigatória.'],
    trim: true,
  },
  data: {
    type: Date,
    required: [true, 'A data é obrigatória.'],
  },
  situacao: {
    type: String,
    enum: ['achado', 'perdido'], 
    required: [true, 'A situação é obrigatória (achado/perdido).'],
  },
  fotoUrl: {
    type: String,
    required: false, // Será preenchido após o upload da imagem
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Faz referência ao modelo 'User'
    required: [true, 'O usuário criador do post é obrigatório.'],
  },
}, {
  timestamps: true, 
});

// 3. Criação e Exportação do Modelo
const Post = mongoose.model<IPost>('Post', PostSchema);

export default Post;