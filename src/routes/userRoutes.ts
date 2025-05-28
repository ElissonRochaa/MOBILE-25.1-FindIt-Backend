import express from 'express';
import {
    createUser,
    getCurrentUserProfile,
    getUserById,
    updateUserProfile,
    updateUserProfilePicture,
    deleteUserAccount
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = express.Router();

router.post('/', upload('users').single('profilePicture'), createUser);

// Rotas protegidas (requerem autenticação)
router.get('/profile', protect, getCurrentUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserAccount);

// Rota para atualizar a foto de perfil
router.put(
    '/profile/picture',
    protect,
    upload('users').single('profilePicture'),
    updateUserProfilePicture
);

router.get('/:id', protect, getUserById);

export default router;