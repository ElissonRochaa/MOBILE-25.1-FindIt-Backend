// src/routes/userRoutes.ts

import express from 'express';
import {
    createUser,
    getCurrentUserProfile,
    getUserById,
    updateUserProfile,
    updateUserProfilePicture,
    deleteUserAccount,
    forgotPassword,
    resetPassword
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

// --- Rotas Públicas (Não Requerem Autenticação / Token JWT) ---
router.post('/', upload('users').single('profilePicture'), createUser);

router.post('/forgot-password', forgotPassword);
// MUDANÇA AQUI: A rota PATCH não tem mais o ':token'
router.patch('/reset-password', resetPassword); // <--- ATENÇÃO AQUI!

// --- Rotas Protegidas (Requerem Autenticação / Token JWT Válido) ---

// Todas as rotas abaixo usarão o middleware 'protect' para verificar o token JWT.
router.get('/profile', protect, getCurrentUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserAccount);

router.put(
    '/profile/picture',
    protect,
    upload('users').single('profilePicture'),
    updateUserProfilePicture
);

router.get('/:id', protect, getUserById);

export default router;