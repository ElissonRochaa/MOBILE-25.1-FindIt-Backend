import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { hashPassword } from '../middlewares/passwordHashMiddleware';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; 
  nome: string;
  email: string;
  senha: string;
  profilePicture?: string; 
  telefone?: string;
  curso?: string;
  createdAt: Date; 
  updatedAt: Date; 
  __v: number;     
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'O email é obrigatório.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Por favor, insira um email válido.'],
  },
  senha: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
    select: false,
  },
  profilePicture: {
    type: String,
    required: false,
    default: 'https://i.imgur.com/V4RclNb.png' 
  },
  telefone: {
    type: String,
    trim: true,
    required: false,
  },
  curso: {
    type: String,
    trim: true,
    required: false,
  },
}, {
  timestamps: true,
});

UserSchema.pre<IUser>('save', hashPassword);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.senha);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;