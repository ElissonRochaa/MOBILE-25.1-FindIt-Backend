import { RequestHandler } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const createUser: RequestHandler = async (req, res): Promise<void> => {
  const { nome, email, senha, telefone, curso } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Este email já está cadastrado.' });
      return;
    }

    const newUser = new User({ nome, email, senha, telefone, curso });
    await newUser.save();

    res.status(201).json(newUser);

  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};

export const getCurrentUserProfile: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const getUserById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const updateUserProfile: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { nome, telefone, curso } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nome, telefone, curso },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const updateUserProfilePicture: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
        return;
      }
  
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
      const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        { profilePicture: imageUrl },
        { new: true }
      );
      
      if (!updatedUser) {
          res.status(404).json({ message: 'Usuário não encontrado.' });
          return;
      }
  
      res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', user: updatedUser });
  
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const deleteUserAccount: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user?.id);
    if (!deletedUser) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json({ message: 'Sua conta foi deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};