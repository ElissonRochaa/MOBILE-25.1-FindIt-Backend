import { Router } from 'express';

import { protect } from '../middlewares/authMiddleware';

import upload from '../middlewares/uploadMiddleware';


import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/postController';

const postRouter = Router();
postRouter.get('/', getPosts);

postRouter.get('/:id', getPostById);


postRouter.post('/', protect, upload.single('foto'), createPost);
postRouter.put('/:id', protect, upload.single('foto'), updatePost);
postRouter.delete('/:id', protect, deletePost);

export default postRouter;