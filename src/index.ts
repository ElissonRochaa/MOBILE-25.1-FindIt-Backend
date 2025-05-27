import express, { Request, Response } from "express";
import cors from 'cors';
import http from 'http';
import path from 'path';

import { connectToDatabase } from "./config/database";
import { initSocket } from './socket';

import authRouter from "./routes/authRoutes";
import postRouter from "./routes/postRoutes";
import userRouter from './routes/userRoutes';
import conversationRouter from './routes/conversationRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

initSocket(server);

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get("/", (req: Request, res: Response) => {
  res.send("Olá, backend do FindIt rodando com chat em tempo real!");
});

app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/posts', postRouter); 
app.use('/api/v1/users', userRouter);
app.use('/api/v1/conversations', conversationRouter);

const startServer = async () => {
  await connectToDatabase(); 
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
};

startServer();
