const { string } = require('joi');
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    Blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Blog",
        required: true,
        trim: true
    }, 
    author: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        trim: true
    }
}, { timestamps: true });
const Blog = mongoose.model('Blog', CommentSchema);

module.exports = Blog;
