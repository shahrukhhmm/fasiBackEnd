const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Create a chat
router.post('/create', chatController.createChat);

// Send a message (with optional file upload)
router.post('/send-message', chatController.sendMessage);

// Get chats for a user
router.get('/user/:userId', chatController.getChatsForUser);

// Get group chats for a user
router.get('/user/:userId/groups', chatController.getGroupChatsForUser);

// Get a specific chat
router.get('/:chatId', chatController.getChat);

// Get chat ID between two users
router.get('/chatId/:senderId/:receiverId', chatController.getChatId);

// Get chat history by chat ID
router.get('/chatHistory/:chatId', chatController.getChatHistory);

// Edit a group chat (add or remove users)
router.put('/edit/:chatId', chatController.editGroupChat);

// Delete a chat
router.delete('/:chatId', chatController.deleteChat);

// Edit group chat name
router.put('/edit-name/:chatId', chatController.editGroupName);

module.exports = router;
