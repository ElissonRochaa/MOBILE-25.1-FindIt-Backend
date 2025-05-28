import { RequestHandler } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Função auxiliar para tratamento de erros
const handleError = (res: any, error: any, message: string) => {
    console.error(message, error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
};

// [CREATE] Adiciona um comentário a um post específico.
export const addComment: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { texto } = req.body;
        const autor = req.user?.id;
        const { postId } = req.params;

        const newComment = new Comment({ post: postId, autor, texto });
        await newComment.save();

        await Post.findByIdAndUpdate(postId, { $push: { comentarios: newComment._id } });

        const populatedComment = await newComment.populate('autor', 'nome profilePicture');
        res.status(201).json(populatedComment);

    } catch (error) {
        handleError(res, error, 'Erro ao adicionar comentário:');
    }
};

// [READ] Busca todos os comentários de um post específico.
export const getCommentsForPost: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('autor', 'nome profilePicture')
            .sort({ createdAt: 'asc' }); // Ordena do mais antigo para o mais novo

        res.status(200).json(comments);
    } catch (error) {
        handleError(res, error, 'Erro ao buscar comentários:');
    }
};

// [UPDATE] Atualiza o texto de um comentário existente.
export const updateComment: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { commentId } = req.params;
        const { texto } = req.body;
        const userId = req.user?.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comentário não encontrado.' });
            return;
        }

        // Verificação de segurança: Apenas o autor original pode editar.
        if (comment.autor.toString() !== userId) {
            res.status(403).json({ message: 'Acesso negado. Você não tem permissão para editar este comentário.' });
            return;
        }

        comment.texto = texto;
        await comment.save();

        const populatedComment = await comment.populate('autor', 'nome profilePicture');
        res.status(200).json(populatedComment);

    } catch (error) {
        handleError(res, error, 'Erro ao atualizar comentário:');
    }
};

// [DELETE] Deleta um comentário.
export const deleteComment: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user?.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: 'Comentário não encontrado.' });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post associado não encontrado.' });
            return;
        }

        const isCommentAuthor = comment.autor.toString() === userId;
        const isPostAuthor = post.autor.toString() === userId;

        // Verificação de segurança: Permite deletar se for o autor do comentário OU o autor do post.
        if (!isCommentAuthor && !isPostAuthor) {
            res.status(403).json({ message: 'Acesso negado. Você não tem permissão para deletar este comentário.' });
            return;
        }
        
        // Remove a referência do comentário do array no documento do Post
        await Post.findByIdAndUpdate(postId, { $pull: { comentarios: commentId } });
        
        // Deleta o comentário em si
        await comment.deleteOne();

        res.status(200).json({ message: 'Comentário deletado com sucesso.' });

    } catch (error) {
        handleError(res, error, 'Erro ao deletar comentário:');
    }
};