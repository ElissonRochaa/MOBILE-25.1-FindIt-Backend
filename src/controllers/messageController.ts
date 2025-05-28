import { Response } from 'express';
import { getIo } from '../socket'; 
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { AuthenticatedRequest } from '../middlewares/authMiddleware'; 

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => { 
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.id;
    const io = getIo();

    console.log(`[CHAT DEBUG] sendMessage: Recebida requisição para conversationId: ${conversationId} de senderId: ${senderId}`);

    if (!content) {
        console.log(`[CHAT DEBUG] sendMessage: Conteúdo da mensagem vazio.`);
        res.status(400).json({ message: 'O conteúdo da mensagem não pode estar vazio.' });
        return;
    }
    if (!conversationId) {
        console.log(`[CHAT DEBUG] sendMessage: conversationId não fornecido nos parâmetros.`);
        res.status(400).json({ message: 'ID da conversa não fornecido.' });
        return;
    }
     if (!senderId) {
        console.log(`[CHAT DEBUG] sendMessage: senderId não encontrado. Usuário não autenticado?`);
        res.status(401).json({ message: 'Usuário não autenticado.' });
        return;
    }

    try {
        const conversationExists = await Conversation.findById(conversationId);
        if (!conversationExists) {
            console.log(`[CHAT DEBUG] sendMessage: Conversa com ID ${conversationId} não encontrada.`);
            res.status(404).json({ message: 'Conversa não encontrada.' });
            return;
        }

        const newMessage = new Message({
            conversation: conversationId,
            sender: senderId,
            content,
        });

        await newMessage.save();
        console.log(`[CHAT DEBUG] sendMessage: Nova mensagem salva com ID: ${newMessage._id}`);

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
        });
        console.log(`[CHAT DEBUG] sendMessage: Conversa ${conversationId} atualizada com lastMessage: ${newMessage._id}`);

        const populatedMessage = await newMessage.populate('sender', 'nome email profilePicture');
        console.log('[CHAT DEBUG] sendMessage: Mensagem populada:', JSON.stringify(populatedMessage, null, 2));

        console.log(`[CHAT DEBUG] ---> Tentando emitir 'newMessage' para a sala: ${conversationId}`);
        console.log('[CHAT DEBUG] ---> Payload da mensagem a ser emitida:', JSON.stringify(populatedMessage, null, 2));
        
        io.to(conversationId).emit('newMessage', populatedMessage);
        
        console.log(`[CHAT DEBUG] ---> Evento 'newMessage' teoricamente emitido para a sala: ${conversationId}`);

  
        res.status(201).json(populatedMessage);

    } catch (error: any) {
        console.error('[CHAT DEBUG] sendMessage: Erro no bloco try/catch:', error);
        res.status(500).json({ message: 'Erro no servidor ao enviar mensagem', error: error.message });

    }
};

export const getMessagesFromConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { conversationId } = req.params;
    console.log(`[CHAT DEBUG] getMessagesFromConversation: Recebida requisição para conversationId: ${conversationId}`);

    try {
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'nome email profilePicture')
            .sort({ createdAt: 'asc' });
        
        console.log(`[CHAT DEBUG] getMessagesFromConversation: ${messages.length} mensagens encontradas para conversationId: ${conversationId}`);
        res.status(200).json(messages);

    } catch (error: any) {
        console.error('[CHAT DEBUG] getMessagesFromConversation: Erro no bloco try/catch:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar mensagens', error: error.message });
    }
};