import { Request, Response } from 'express';
import Post, { IPost } from '../models/Post';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';


interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
  file?: Express.Multer.File;
}

const UPLOADS_FOLDER = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}

function parseDate(input: string): Date | null {
  if (!input) return null;

  // Tenta primeiro ISO
  const isoDate = new Date(input);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Tenta dd/mm/yyyy
  const parts = input.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return !isNaN(date.getTime()) ? date : null;
  }

  return null;
}

export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nomeItem, descricao, data, situacao } = req.body;
  const usuario = req.user?.id;

  if (!usuario) {
    res.status(401).json({ message: 'Usuário não autenticado.' });
    return;
  }

  const parsedDate = parseDate(data);
  const fotoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  if (!parsedDate) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: 'Formato de data inválido. Use "dd/mm/yyyy" ou "yyyy-mm-dd".' });
    return;
  }

  try {
    const newPost: IPost = new Post({
      nomeItem,
      descricao,
      data: parsedDate,
      situacao,
      fotoUrl,
      usuario,
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post criado com sucesso!',
      post: newPost,
    });
  } catch (error: any) {
    console.error('Erro ao criar post:', error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }

    res.status(500).json({ message: 'Erro interno do servidor ao criar post.' });
  }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find().populate('usuario', 'nome email');
    res.status(200).json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar posts.' });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'ID inválido. O ID deve ser um ObjectId válido do MongoDB.' });
    return;
  }

  try {
    const post = await Post.findById(id).populate('usuario', 'nome email');
    if (!post) {
      res.status(404).json({ message: 'Post não encontrado.' });
      return;
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar post.' });
  }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nomeItem, descricao, data, situacao } = req.body;
  const postId = req.params.id;
  const usuarioId = req.user?.id;

  if (!usuarioId) {
    res.status(401).json({ message: 'Usuário não autenticado.' });
    return;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ message: 'Post não encontrado.' });
      return;
    }

    if (post.usuario.toString() !== usuarioId) {
      res.status(403).json({ message: 'Você não tem permissão para atualizar este post.' });
      return;
    }

    const parsedDate = parseDate(data);

    if (data && !parsedDate) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: 'Formato de data inválido. Use "dd/mm/yyyy" ou "yyyy-mm-dd".' });
      return;
    }

    post.nomeItem = nomeItem || post.nomeItem;
    post.descricao = descricao || post.descricao;
    post.data = parsedDate || post.data;
    post.situacao = situacao || post.situacao;

    if (req.file) {
      if (post.fotoUrl) {
        const oldPhotoPath = path.join(__dirname, '../..', post.fotoUrl);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      post.fotoUrl = `/uploads/${req.file.filename}`;
    }

    await post.save();
    res.status(200).json({
      message: 'Post atualizado com sucesso!',
      post,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar post:', error);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar post.' });
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const postId = req.params.id;
  const usuarioId = req.user?.id;

  if (!usuarioId) {
    res.status(401).json({ message: 'Usuário não autenticado.' });
    return;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ message: 'Post não encontrado.' });
      return;
    }

    if (post.usuario.toString() !== usuarioId) {
      res.status(403).json({ message: 'Você não tem permissão para deletar este post.' });
      return;
    }

    if (post.fotoUrl) {
      const photoPath = path.join(__dirname, '../..', post.fotoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar post.' });
  }
};
