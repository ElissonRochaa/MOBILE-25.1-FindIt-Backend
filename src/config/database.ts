import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;

export const connectToDatabase = async (): Promise<void> => {
  if (!mongoUri) {
    console.error('Erro: Variável de ambiente MONGO_URI não definida no .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};