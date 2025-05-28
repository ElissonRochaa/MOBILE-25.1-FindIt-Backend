import express from 'express';
import {
  createPost,
  getAllPosts,
  deletePost,
  resolvePost,
} from '../controllers/postController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import commentRouter from './commentRoutes'; // Importa o router de comentários

const router = express.Router();

// Aninha as rotas de comentários sob as rotas de post
// Qualquer requisição para /:postId/comments será redirecionada para o commentRouter
router.use('/:postId/comments', commentRouter);

// --- Rotas Principais de Posts ---

// POST /api/v1/posts -> Criar um novo post
router.post('/', protect, upload('posts').single('foto'), createPost);

// GET /api/v1/posts -> Listar todos os posts ativos
router.get('/', getAllPosts);

// DELETE /api/v1/posts/:postId -> Deletar um post específico
router.delete('/:postId', protect, deletePost);

// PATCH /api/v1/posts/:postId/resolve -> Marcar um post como resolvido
router.patch('/:postId/resolve', protect, resolvePost);

export default router;