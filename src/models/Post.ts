import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para tipagem forte do documento do Post,
 * incluindo o novo status 'resolvido'.
 */
export interface IPost extends Document {
  autor: mongoose.Schema.Types.ObjectId;
  fotoUrl: string;
  nomeItem: string;
  descricao: string;
  dataOcorrencia: Date;
  situacao: 'perdido' | 'achado' | 'resolvido';
  comentarios: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referência ao model de Usuário
      required: true,
    },
    fotoUrl: {
      type: String,
      required: true,
    },
    nomeItem: {
      type: String,
      required: [true, 'O nome do item é obrigatório.'],
    },
    descricao: {
      type: String,
      required: [true, 'A descrição é obrigatória.'],
    },
    dataOcorrencia: {
      type: Date,
      required: [true, 'A data da ocorrência é obrigatória.'],
    },
    situacao: {
      type: String,
      enum: ['perdido', 'achado', 'resolvido'], // Enum atualizado
      default: 'perdido', // Um valor padrão é uma boa prática
      required: [true, 'A situação (perdido ou achado) é obrigatória.'],
    },
    comentarios: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', // Array de referências ao model de Comentário
      },
    ],
  },
  {
    // Adiciona os campos createdAt e updatedAt automaticamente
    timestamps: true,
  }
);

export default mongoose.model<IPost>('Post', PostSchema);