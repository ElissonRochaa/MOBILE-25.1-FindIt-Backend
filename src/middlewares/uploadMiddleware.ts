// src/middlewares/uploadMiddleware.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Diretório onde as imagens serão salvas
const uploadDir = 'uploads/';

// Garante que o diretório de uploads exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 1. Configuração de Armazenamento (Storage)
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb) {
    cb(null, uploadDir); // Salva os arquivos na pasta 'uploads/'
  },
  filename: function (req: Request, file: Express.Multer.File, cb) {
    // Cria um nome de arquivo único para evitar conflitos de nomes
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Filtro de Arquivos (File Filter)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceita apenas arquivos que começam com 'image/' no mimetype
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // Rejeita o arquivo e passa uma mensagem de erro
    cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas!'));
  }
};

// 3. Instância do Multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 1024 * 1024 * 5 // Limita o tamanho do arquivo a 5MB
  }
});

export default upload;