import { Request, Response, RequestHandler } from 'express'; 
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

const generateToken = (id: string): string => {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definida nas variáveis de ambiente.');
  }
  return jwt.sign({ id }, jwtSecret, { expiresIn: '1h' });
};

export const registerUser: RequestHandler = async (req, res): Promise<void> => {
  const { nome, email, senha, telefone, curso } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Este email já está cadastrado.' });
      return; 
    }

    const newUser: IUser = new User({
      nome,
      email,
      senha,
      telefone,
      curso,
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString());

    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: {
        id: newUser._id,
        nome: newUser.nome,
        email: newUser.email,
        telefone: newUser.telefone,
        curso: newUser.curso,
      },
      token,
    });
    return; 
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
    }
    return; 
  }
};

export const loginUser: RequestHandler = async (req, res): Promise<void> => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email }).select('+senha');

    if (!user) {
      res.status(400).json({ message: 'Credenciais inválidas.' });
      return; 
    }

    const isMatch = await user.comparePassword(senha);

    if (!isMatch) {
      res.status(400).json({ message: 'Credenciais inválidas.' });
      return; 
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        curso: user.curso,
      },
      token,
    });
    return; 
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    return; 
  }
};