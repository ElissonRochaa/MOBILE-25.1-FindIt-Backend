// src/controllers/postController.ts

import { Request, Response, RequestHandler } from 'express';
import Post from '../models/Post';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// --- FUNÇÕES DE UTILIDADE ---
function parseDate(input: string): Date | null {
  if (!input) return null;
  const isoDate = new Date(input);
  if (!isNaN(isoDate.getTime())) return isoDate;
  const parts = input.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    return !isNaN(date.getTime()) ? date : null;
  }
  return null;
}

// --- CONTROLLERS DO CRUD ---

/**
 * @description Cria um novo post.
 * @route POST /api/v1/posts
 */
export const createPost: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nomeItem, descricao, data, situacao } = req.body;
  const usuario = req.user?.id;
  
  const parsedDate = parseDate(data);
  if (!parsedDate) {
    res.status(400).json({ message: 'Formato de data inválido. Use "dd/mm/yyyy" ou "yyyy-mm-dd".' });
    return;
  }

  const fotoUrl = req.file 
    ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` 
    : undefined;

  try {
    const newPost = new Post({ nomeItem, descricao, data: parsedDate, situacao, fotoUrl, usuario });
    await newPost.save();
    res.status(201).json({ message: 'Post criado com sucesso!', post: newPost });
  } catch (error: any) {
    if (req.file) { fs.unlinkSync(req.file.path); }
    console.error('Erro ao criar post:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};

/**
 * @description Atualiza um post existente.
 * @route PUT /api/v1/posts/:id
 */
export const updatePost: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { nomeItem, descricao, data, situacao } = req.body;
    const postId = req.params.id;
    const usuarioId = req.user?.id;
  
    try {
      const post = await Post.findById(postId);
      if (!post) {
        if (req.file) fs.unlinkSync(req.file.path); // Limpa o arquivo se o post não existir
        res.status(404).json({ message: 'Post não encontrado.' });
        return;
      }
      if (post.usuario.toString() !== usuarioId) {
        if (req.file) fs.unlinkSync(req.file.path); // Limpa o arquivo se não houver permissão
        res.status(403).json({ message: 'Você não tem permissão para atualizar este post.' });
        return;
      }
  
      post.nomeItem = nomeItem || post.nomeItem;
      post.descricao = descricao || post.descricao;
      post.situacao = situacao || post.situacao;
      if (data) post.data = parseDate(data) || post.data;
  
      if (req.file) {
        if (post.fotoUrl) {
          const oldPhotoName = path.basename(post.fotoUrl);
          const oldPhotoPath = path.join('uploads', oldPhotoName);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        post.fotoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
  
      const updatedPost = await post.save();
      res.status(200).json({ message: 'Post atualizado com sucesso!', post: updatedPost });
    } catch (error: any) {
      if (req.file) { fs.unlinkSync(req.file.path); }
      console.error('Erro ao atualizar post:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @description Deleta um post.
 * @route DELETE /api/v1/posts/:id
 */
export const deletePost: RequestHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const postId = req.params.id;
    const usuarioId = req.user?.id;

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
            const photoName = path.basename(post.fotoUrl);
            const photoPath = path.join('uploads', photoName);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar post:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// --- FUNÇÕES 'GET' QUE NÃO PRECISAVAM DE MUDANÇA (AGORA DEFINIDAS CORRETAMENTE) ---

/**
 * @description Busca todos os posts.
 * @route GET /api/v1/posts
 */
export const getPosts: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 }).populate('usuario', 'nome email profilePicture');
      res.status(200).json(posts);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar posts.' });
    }
};

/**
 * @description Busca um post específico pelo seu ID.
 * @route GET /api/v1/posts/:id
 */
export const getPostById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'ID de post inválido.' });
      return;
    }
  
    try {
      const post = await Post.findById(id).populate('usuario', 'nome email profilePicture');
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