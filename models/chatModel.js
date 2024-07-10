const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'audio'], default: 'text' },
    fileUrl: { type: String }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema],
    isGroupChat: { type: Boolean, default: false },
    groupName: { 
        type: String,
        validate: {
            validator: function(value) {
                return !this.isGroupChat || (this.isGroupChat && value != null);
            },
            message: 'Group name is required for group chats.'
        }
    }
}, { timestamps: true });

// Method to add a participant to the chat
chatSchema.methods.addParticipant = function(userId) {
    if (!this.participants.includes(userId)) {
        this.participants.push(userId);
    }
};

// Method to remove a participant from the chat
chatSchema.methods.removeParticipant = function(userId) {
    const index = this.participants.indexOf(userId);
    if (index !== -1) {
        this.participants.splice(index, 1);
    }
};

module.exports = mongoose.model('Chat', chatSchema);
