import { Router } from 'express';
import { signIn, signOut } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const authRouter = Router();

authRouter.post('/signin', signIn);
authRouter.post('/signout', protect, signOut);

export default authRouter;