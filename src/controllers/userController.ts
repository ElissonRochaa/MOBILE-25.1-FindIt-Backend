import { RequestHandler } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * @description Cria um novo usuário (sem imagem de perfil).
 * @route POST /api/v1/users
 */
export const createUser: RequestHandler = async (req, res): Promise<void> => {
  // 1. Apenas os dados de texto são recebidos aqui.
  // A 'profilePicture' será definida com o valor 'default' do nosso Model.
  const { nome, email, senha, telefone, curso } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Este email já está cadastrado.' });
      return;
    }

    const newUser = new User({ nome, email, senha, telefone, curso });
    await newUser.save();

    res.status(201).json(newUser);

  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ message: messages.join(', ') });
    } else {
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};

/**
 * @description Busca o perfil do usuário atualmente logado.
 * @route GET /api/v1/users/me
 */
export const getCurrentUserProfile: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @description Busca um usuário específico pelo ID.
 * @route GET /api/v1/users/:id
 */
export const getUserById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @description Atualiza as informações de texto do perfil do usuário logado.
 * @route PUT /api/v1/users/me
 */
export const updateUserProfile: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user?.id;
    // 2. Apenas os dados de texto são atualizados aqui. A foto é atualizada em outra rota.
    const { nome, telefone, curso } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nome, telefone, curso },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @description Faz o upload ou atualiza a foto de perfil do usuário logado.
 * @route PUT /api/v1/users/me/photo
 */
export const updateUserProfilePicture: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      // 3. O middleware 'multer' nos dá acesso ao 'req.file'.
      if (!req.file) {
        res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
        return;
      }
  
      // 4. Construímos a URL completa para ser salva no banco de dados.
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
      const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
        { profilePicture: imageUrl },
        { new: true } // Retorna o documento atualizado
      );
      
      if (!updatedUser) {
          res.status(404).json({ message: 'Usuário não encontrado.' });
          return;
      }
  
      res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', user: updatedUser });
  
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @description Deleta a conta do usuário logado.
 * @route DELETE /api/v1/users/me
 */
export const deleteUserAccount: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user?.id);
    if (!deletedUser) {
      res.status(404).json({ message: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json({ message: 'Sua conta foi deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};