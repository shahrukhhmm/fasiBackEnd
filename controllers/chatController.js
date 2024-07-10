const Chat = require('../models/chatModel');
const mongoose = require('mongoose'); 

// Create a single or group chat
exports.createChat = async (req, res) => {
    const { participants, isGroupChat, groupName } = req.body;
    try {
        const chat = new Chat({ participants, isGroupChat, groupName: isGroupChat ? groupName : undefined });
        await chat.save();
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    const { chatId, sender, content, type, fileUrl } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        const message = { sender, content, type, fileUrl };
        chat.messages.push(message);
        await chat.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get chat ID between two users
exports.getChatId = async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
        const chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId], $size: 2 },
            isGroupChat: false
        });
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.status(200).json({ chatId: chat._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get chat history by chat ID
exports.getChatHistory = async (req, res) => {
    const { chatId } = req.params;
    try {
        const chat = await Chat.findById(chatId).populate('participants').populate('messages.sender');
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.status(200).json(chat.messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get chats for a user
exports.getChatsForUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const chats = await Chat.find({ participants: userId }).populate('participants').populate('messages.sender');
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get group chats for a user
exports.getGroupChatsForUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const chats = await Chat.find({ participants: userId, isGroupChat: true }).populate('participants');
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific chat
exports.getChat = async (req, res) => {
    const { chatId } = req.params;
    try {
        const chat = await Chat.findById(chatId).populate('participants').populate('messages.sender');
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit a group chat (add or remove users)
exports.editGroupChat = async (req, res) => {
    const { chatId } = req.params;
    const { action, userId } = req.body; // action: 'add' or 'remove'

    try {
        // Validate the chat ID and user ID
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: 'Invalid chat ID' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (!chat.isGroupChat) {
            return res.status(400).json({ message: 'Cannot edit non-group chat' });
        }

        if (action === 'add') {
            // Check if user is already in the chat
            if (chat.participants.includes(userId)) {
                return res.status(400).json({ message: 'User is already in the chat' });
            }
            chat.participants.push(userId);
        } else if (action === 'remove') {
            const index = chat.participants.indexOf(userId);
            if (index === -1) {
                return res.status(400).json({ message: 'User is not in the chat' });
            }
            chat.participants.splice(index, 1);
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await chat.save();
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
    const { chatId } = req.params;

    try {
        // Validate the chat ID
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: 'Invalid chat ID' });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        await Chat.findByIdAndDelete(chatId);
        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Edit group chat name
exports.editGroupName = async (req, res) => {
    const { chatId } = req.params;
    const { groupName } = req.body;

    try {
        // Validate the chat ID
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: 'Invalid chat ID' });
        }

        // Find the chat by ID
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if it is a group chat
        if (!chat.isGroupChat) {
            return res.status(400).json({ message: 'Not a group chat' });
        }

        // Update the group name
        chat.groupName = groupName;
        await chat.save();

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};