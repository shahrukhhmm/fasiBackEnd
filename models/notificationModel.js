const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'share', 'message'], required: true },
    message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
