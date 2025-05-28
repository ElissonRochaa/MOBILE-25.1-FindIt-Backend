import express from 'express';
import {
    addComment,
    getCommentsForPost,
    updateComment,
    deleteComment
} from '../controllers/commentController';
import { protect } from '../middlewares/authMiddleware';

/**
 * O objeto { mergeParams: true } permite que este router acesse
 * o parâmetro ':postId' definido na rota pai ('postRoutes.ts').
 */
const router = express.Router({ mergeParams: true });

// [CREATE] POST /api/v1/posts/:postId/comments
router.post('/', protect, addComment);

// [READ] GET /api/v1/posts/:postId/comments
router.get('/', getCommentsForPost);

// [UPDATE] PATCH /api/v1/posts/:postId/comments/:commentId
router.patch('/:commentId', protect, updateComment);

// [DELETE] DELETE /api/v1/posts/:postId/comments/:commentId
router.delete('/:commentId', protect, deleteComment);

export default router;