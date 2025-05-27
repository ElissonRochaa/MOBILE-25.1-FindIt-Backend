import { Response } from 'express';

import { getIo } from '../socket';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.id;
    const io = getIo();

    try {
        const newMessage = new Message({
            conversation: conversationId,
            sender: senderId,
            content,
        });

        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
        });

        const populatedMessage = await newMessage.populate('sender', 'nome email profilePicture');

        io.to(conversationId).emit('newMessage', populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error });
    }
};

export const getMessagesFromConversation = async (req: AuthenticatedRequest, res: Response) => {
    const { conversationId } = req.params;

    try {
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'nome email profilePicture')
            .sort({ createdAt: 'asc' });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error });
    }
};