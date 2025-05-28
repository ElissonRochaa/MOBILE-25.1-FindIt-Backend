import { RequestHandler } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Função auxiliar para tratamento de erros
const handleError = (res: any, error: any, message: string) => {
    console.error(message, error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    return res.status(500).json({ message: 'Erro interno do servidor.' });
};

// POST /api/users - Criar um novo usuário com foto de perfil
export const createUser: RequestHandler = async (req, res): Promise<void> => {
    const { nome, email, senha, telefone, curso } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Este email já está cadastrado.' });
            return;
        }

        let profilePictureUrl = '';
        if (req.file) {
            profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/users/${req.file.filename}`;
        }

        const newUser = new User({
            nome,
            email,
            senha,
            telefone,
            curso,
            profilePicture: profilePictureUrl,
        });

        await newUser.save();

        res.status(201).json(newUser);

    } catch (error: any) {
        handleError(res, error, 'Erro ao criar usuário:');
    }
};

// GET /api/users/profile - Obter perfil do usuário logado
export const getCurrentUserProfile: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        handleError(res, error, 'Erro ao buscar perfil do usuário:');
    }
};

// GET /api/users/:id - Obter usuário por ID
export const getUserById: RequestHandler = async (req, res): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        handleError(res, error, 'Erro ao buscar usuário por ID:');
    }
};

// PUT /api/users/profile - Atualizar perfil do usuário
export const updateUserProfile: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { nome, telefone, curso } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user?.id,
            { nome, telefone, curso },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
    } catch (error) {
        handleError(res, error, 'Erro ao atualizar perfil:');
    }
};

// PUT /api/users/profile/picture - Atualizar foto de perfil do usuário
export const updateUserProfilePicture: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
            return;
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/users/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            req.user?.id,
            { profilePicture: imageUrl },
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }

        res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!', user: updatedUser });

    } catch (error) {
        handleError(res, error, 'Erro ao atualizar foto de perfil:');
    }
};

// DELETE /api/users/profile - Deletar conta do usuário
export const deleteUserAccount: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user?.id);
        if (!deletedUser) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }
        res.status(200).json({ message: 'Sua conta foi deletada com sucesso.' });
    } catch (error) {
        handleError(res, error, 'Erro ao deletar conta:');
    }
};