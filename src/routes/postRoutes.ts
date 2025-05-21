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
    // Certifique-se de que a pasta 'uploads' existe na raiz do seu projeto
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens (jpeg, jpg, png, gif) são permitidas!'));
    }
  },
});

// Rotas de Post
// A maioria das rotas de post (exceto talvez GET ALL) deve ser protegida
postRouter.post('/', protect, upload.single('foto'), createPost); // 'foto' é o nome do campo no formulário
postRouter.get('/', getPosts); // Pode ser público ou protegido, dependendo da sua necessidade
postRouter.get('/:id', getPostById);
postRouter.put('/:id', protect, upload.single('foto'), updatePost); // Opcional: permitir atualizar foto
postRouter.delete('/:id', protect, deletePost);

export default postRouter;