import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Conversation from './models/Conversation';

dotenv.config();

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
  };
}

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Autenticação falhou: Token não fornecido.'));
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('Chave secreta JWT não configurada no servidor.');
      }

      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      next(new Error('Autenticação falhou: Token inválido.'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Cliente autenticado e conectado: ${socket.id}, UserID: ${socket.user?.id}`);

    socket.on('joinRoom', async (conversationId: string) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user?.id
        });

        if (conversation) {
          socket.join(conversationId);
          console.log(`Socket ${socket.id} (UserID: ${socket.user?.id}) entrou na sala ${conversationId}`);
        } else {
          console.log(`Socket ${socket.id} (UserID: ${socket.user?.id}) tentou entrar na sala ${conversationId} sem permissão.`);
          socket.emit('auth_error', { message: 'Acesso negado a esta sala.' });
        }
      } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        socket.emit('error', { message: 'Erro interno ao processar sua solicitação.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error('Socket.io não foi inicializado!');
  }
  return io;
};