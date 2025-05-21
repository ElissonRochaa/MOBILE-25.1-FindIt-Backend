import { Request, Response } from 'express';
import Post, { IPost } from '../models/Post';
import path from 'path'; 
import fs from 'fs';  

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const UPLOADS_FOLDER = path.join(__dirname, '../../uploads');


if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}


export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { nomeItem, descricao, data, situacao } = req.body;
  const usuario = req.user?.id; 

  if (!usuario) {
    res.status(401).json({ message: 'Usuário não autenticado.' });
    return;
  }


  const fotoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const newPost: IPost = new Post({
      nomeItem,
      descricao,
      data: new Date(data), 
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

    if (req.file && fs.existsSync(req.file.path)) {
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

// 2. Obter todos os Posts
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find().populate('usuario', 'nome email'); // Retorna apenas nome e email do usuário
    res.status(200).json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar posts.' });
  }
};

// 3. Obter um Post por ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id).populate('usuario', 'nome email');
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

// 4. Atualizar um Post
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

    // Verifica se o usuário autenticado é o criador do post
    if (post.usuario.toString() !== usuarioId) {
      res.status(403).json({ message: 'Você não tem permissão para atualizar este post.' });
      return;
    }

    // Atualiza os campos
    post.nomeItem = nomeItem || post.nomeItem;
    post.descricao = descricao || post.descricao;
    post.data = data ? new Date(data) : post.data;
    post.situacao = situacao || post.situacao;

    // Lida com a atualização da foto (se uma nova for enviada)
    if (req.file) {
      // Se já existia uma foto, deleta a antiga
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
    if (req.file && fs.existsSync(req.file.path)) {
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

// 5. Deletar um Post
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
    // Verifica se o usuário autenticado é o criador do post
    if (post.usuario.toString() !== usuarioId) {
      res.status(403).json({ message: 'Você não tem permissão para deletar este post.' });
      return;
    }

    // Deleta a foto associada, se houver
    if (post.fotoUrl) {
      const photoPath = path.join(__dirname, '../..', post.fotoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await post.deleteOne(); // Usa deleteOne() ou remove() para remover o documento
    res.status(200).json({ message: 'Post deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao deletar post.' });
  }
};