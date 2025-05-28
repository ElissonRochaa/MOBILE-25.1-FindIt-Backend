import express, { Request, Response } from "express";
import cors from 'cors';
import http from 'http';
import path from 'path';

import { connectToDatabase } from "./config/database";
import { initSocket } from './socket';

// Importação das rotas
import authRouter from "./routes/authRoutes";
import userRouter from './routes/userRoutes';
import postRouter from "./routes/postRoutes"; // <-- LINHA ADICIONADA
import conversationRouter from './routes/conversationRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

// Inicializa o Socket.IO
initSocket(server);

// Middlewares essenciais
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Middleware para servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rota de teste
app.get("/", (req: Request, res: Response) => {
  res.send("Olá, backend do FindIt rodando com chat em tempo real!");
});

// Middlewares de Rota da API
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter); // <-- LINHA ADICIONADA
app.use('/api/v1/conversations', conversationRouter);

// Função para iniciar o servidor
const startServer = async () => {
  await connectToDatabase();
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();