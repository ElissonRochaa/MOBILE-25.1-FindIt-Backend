import { Router } from 'express';
import { loginUser, registerUser, getUserById } from '../controllers/authController';

const authRouter = Router(); 

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/user/:id', getUserById);

export default authRouter;