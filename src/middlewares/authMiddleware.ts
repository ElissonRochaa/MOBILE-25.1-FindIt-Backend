import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request { 
  user?: {
    id: string;
  };
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!jwtSecret) {
        throw new Error('JWT_SECRET não está definida nas variáveis de ambiente.');
      }

      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      const user = await User.findById(decoded.id).select('-senha');

      if (!user) {
        res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
        return;
      }

      req.user = { id: user._id.toString() };
      next(); 

    } catch (error) {
      console.error('Erro de autenticação (token inválido):', error);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, nenhum token.' });
    return;
  }
};