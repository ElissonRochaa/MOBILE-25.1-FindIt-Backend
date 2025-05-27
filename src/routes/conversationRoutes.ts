import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware'; 
import { createOrGetConversation, getUserConversations } from '../controllers/conversationController';
import { getMessagesFromConversation, sendMessage } from '../controllers/messageController';

const router = Router();

router.post('/', protect, createOrGetConversation);
router.get('/', protect, getUserConversations);
router.post('/:conversationId/messages', protect, sendMessage);
router.get('/:conversationId/messages', protect, getMessagesFromConversation);

export default router;