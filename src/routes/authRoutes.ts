// src/routes/authRoutes.ts

import { Router } from 'express';

// 1. Importe as funções corretas do authController: signIn e signOut
import { signIn, signOut } from '../controllers/authController';

// 2. Importe o middleware 'protect' para a rota de logout, pois você precisa estar logado para sair.
import { protect } from '../middlewares/authMiddleware';

const authRouter = Router();

// Rota para autenticar (logar) um usuário.
// O endpoint foi alterado de /login para /signin para manter a consistência com o nome da função.
// Ex: POST /api/v1/auth/signin
authRouter.post('/signin', signIn);

// Rota para deslogar um usuário. Requer que o usuário esteja logado.
// Ex: POST /api/v1/auth/signout
authRouter.post('/signout', protect, signOut);

// A rota '/register' foi REMOVIDA daqui, pois agora ela está em userRoutes.ts (POST /api/v1/users/)

export default authRouter;