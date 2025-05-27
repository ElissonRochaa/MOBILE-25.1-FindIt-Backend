import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';
import { 
    createUser,
    getUserById, 
    getCurrentUserProfile, 
    updateUserProfile, 
    deleteUserAccount,
    updateUserProfilePicture 
} from '../controllers/userController';

const userRouter = Router();

userRouter.post('/', createUser);
userRouter.get('/me', protect, getCurrentUserProfile);
userRouter.put('/me', protect, updateUserProfile);
userRouter.delete('/me', protect, deleteUserAccount);

userRouter.put(
    '/me/photo', 
    protect,
    upload.single('profilePicture'),
    updateUserProfilePicture
);

userRouter.get('/:id', protect, getUserById);

export default userRouter;