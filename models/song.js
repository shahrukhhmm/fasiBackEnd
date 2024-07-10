const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    author_name: {
        type: String,
        trim: true,
        required: true
    },
    lang: {
        type: String,
        trim: true,
        required: true
    },
    type: {
        type: String,
        trim: true,
        required: true
    },
    musicName: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        trim: true,
    },
    individual: {
        type: Boolean,
        default: true
    },
    img: {
        type: String,
        trim: true,
        required: true
    },
    timesPlayed: {
        type: Number,
        default: 0
    },
    attribution: {
        song: {
            type: String,
            trim: true,
        },
        musicBy: {
            type: String,
            trim: true,
        },
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);

module.exports = Song;