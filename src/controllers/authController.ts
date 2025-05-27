import { RequestHandler } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const generateToken = (id: string): string => {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definida nas variáveis de ambiente.');
  }
  return jwt.sign({ id }, jwtSecret, { expiresIn: '1d' });
};

export const signIn: RequestHandler = async (req, res): Promise<void> => {
  const { email, senha } = req.body;
  try {
    const user = await User.findOne({ email }).select('+senha');
    if (!user || !(await user.comparePassword(senha))) {
      res.status(401).json({ message: 'Email ou senha inválidos.' });
      return;
    }

    const token = generateToken(user._id.toString());
    const { senha: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: 'Login realizado com sucesso!',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const signOut: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
  res.status(200).json({ message: 'Logout realizado com sucesso.' });
};