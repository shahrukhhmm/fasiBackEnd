const { string } = require('joi');
const mongoose = require('mongoose');

const LikeSongSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim: true,
    },
    song_id: {
        type: String,
        required: true,
        trim: true
    },
   
}, { timestamps: true });
const LikeSong = mongoose.model('LikeSong', LikeSongSchema);

module.exports = LikeSong;
