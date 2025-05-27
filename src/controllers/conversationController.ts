import { Response } from 'express';
import Conversation from '../models/Conversation';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const createOrGetConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { recipientId } = req.body;
    const senderId = req.user?.id;

    if (!recipientId) {


        res.status(400).json({ message: 'O ID do destinatário é obrigatório.' });
        return;
    }

    if (senderId === recipientId) {

        res.status(400).json({ message: 'Não é possível criar uma conversa consigo mesmo.' });
        return;
    }

    try {
        let conversation = await Conversation.findOne({
            type: 'private',
            participants: { $all: [senderId, recipientId] },
        });

        if (!conversation) {
            conversation = new Conversation({
                type: 'private',
                participants: [senderId, recipientId],
            });
            await conversation.save();
        }

        const populatedConversation = await conversation.populate({
            path: 'participants',
            select: 'nome email profilePicture', 
        });



        res.status(200).json(populatedConversation);

    } catch (error) {

        res.status(500).json({ message: 'Erro no servidor', error });
    }
};


export const getUserConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    try {
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'participants',
                select: 'nome email profilePicture', 
            })
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'nome profilePicture' 
                }
            })
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor', error });
    }
};