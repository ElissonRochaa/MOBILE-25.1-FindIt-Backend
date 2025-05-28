import express from 'express';
import {
  createPost,
  getAllPosts,
  deletePost,
  resolvePost,
  getPostsByUserId, // <-- 1. IMPORTA A NOVA FUNÇÃO
} from '../controllers/postController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import commentRouter from './commentRoutes';

const router = express.Router();

// Aninha as rotas de comentários sob as rotas de post
router.use('/:postId/comments', commentRouter);

// --- Rotas Principais de Posts ---

// Rota para criar um novo post
router.post('/', protect, upload('posts').single('foto'), createPost);

// Rota para listar todos os posts ativos para o feed
router.get('/', getAllPosts);

// ROTA NOVA: Rota para buscar todos os posts de um usuário específico
router.get('/user/:userId', protect, getPostsByUserId); // <-- 2. ADICIONA A NOVA ROTA

// Rota para deletar um post específico
router.delete('/:postId', protect, deletePost);

// Rota para marcar um post como resolvido
router.patch('/:postId/resolve', protect, resolvePost);

export default router;