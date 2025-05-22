// src/routes/postRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/postController';
import { protect } from '../middlewares/authMiddleware';

const postRouter = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens (jpeg, jpg, png, gif) são permitidas!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB max
  fileFilter,
});

// Rotas de Post
postRouter.post('/', protect, upload.single('foto'), createPost);
postRouter.get('/', getPosts);
postRouter.get('/:id', getPostById);
postRouter.put('/:id', protect, upload.single('foto'), updatePost);
postRouter.delete('/:id', protect, deletePost);

export default postRouter;
