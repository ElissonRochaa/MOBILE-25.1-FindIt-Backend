import { RequestHandler } from 'express';
import Post from '../models/Post';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Comment from '../models/Comment';

// Função auxiliar para tratamento de erros
const handleError = (res: any, error: any, message: string) => {
    console.error(message, error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    return res.status(500).json({ message: 'Erro interno do servidor.' });
};

/**
 * Cria um novo post.
 * Requer autenticação e um arquivo de imagem.
 */
export const createPost: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { nomeItem, descricao, dataOcorrencia, situacao } = req.body;
        const autor = req.user?.id; // ID do usuário autenticado

        if (!req.file) {
            res.status(400).json({ message: 'A imagem do post é obrigatória.' });
            return;
        }

        const fotoUrl = `${req.protocol}://${req.get('host')}/uploads/posts/${req.file.filename}`;

        const newPost = new Post({
            autor,
            fotoUrl,
            nomeItem,
            descricao,
            dataOcorrencia,
            situacao,
        });

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        handleError(res, error, 'Erro ao criar post:');
    }
};

/**
 * Lista todos os posts que NÃO estão marcados como "resolvido".
 * Ideal para o feed principal da aplicação.
 */
export const getAllPosts: RequestHandler = async (req, res): Promise<void> => {
  try {
    // Filtra para que a situação seja diferente de 'resolvido'
    const posts = await Post.find({ situacao: { $ne: 'resolvido' } })
      .populate('autor', 'nome profilePicture') // Popula o autor com nome e foto
      .sort({ createdAt: -1 }); // Ordena do mais novo para o mais antigo
    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error, 'Erro ao buscar posts:');
  }
};

// ... (Função addComment que você enviou)
export const addComment: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { texto } = req.body;
        const autor = req.user?.id;
        const { postId } = req.params;

        const newComment = new Comment({ post: postId, autor, texto });
        await newComment.save();

        const post = await Post.findByIdAndUpdate(
            postId,
            { $push: { comentarios: newComment._id } },
            { new: true }
        );

        if (!post) {
            res.status(404).json({ message: "Post não encontrado."});
            return;
        }

        const populatedComment = await newComment.populate('autor', 'nome profilePicture');
        res.status(201).json(populatedComment);

    } catch (error) {
        handleError(res, error, 'Erro ao adicionar comentário:');
    }
};

/**
 * Deleta um post.
 * Requer autenticação e que o usuário seja o dono do post.
 */
export const deletePost: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({ message: 'Post não encontrado.' });
            return;
        }

        if (post.autor.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Acesso negado. Você não é o autor deste post.' });
            return;
        }
        
        await post.deleteOne();
        await Comment.deleteMany({ post: postId });

        res.status(200).json({ message: 'Post deletado com sucesso.' });
    } catch (error) {
        handleError(res, error, 'Erro ao deletar post:');
    }
};

/**
 * Marca um post como "resolvido".
 * Requer autenticação e que o usuário seja o dono do post.
 */
export const resolvePost: RequestHandler = async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({ message: 'Post não encontrado.' });
            return;
        }

        if (post.autor.toString() !== req.user?.id) {
            res.status(403).json({ message: 'Acesso negado. Você não é o autor deste post.' });
            return;
        }

        if (post.situacao === 'resolvido') {
            res.status(400).json({ message: 'Este post já está marcado como resolvido.' });
            return;
        }

        post.situacao = 'resolvido';
        await post.save();

        res.status(200).json({ message: 'Post marcado como resolvido!', post });
    } catch (error) {
        handleError(res, error, 'Erro ao resolver post:');
    }
};


// NOVA FUNÇÃO
/**
 * Lista todos os posts de um usuário específico, incluindo os resolvidos.
 * Ideal para a tela de perfil do usuário.
 */
export const getPostsByUserId: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ autor: userId })
      .populate('autor', 'nome profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error, 'Erro ao buscar posts do usuário:');
  }
};