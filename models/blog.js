const { string } = require('joi');
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    photoPath: {
        type: String,
         trim: true
    },
    author: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        trim: true
    }
}, { timestamps: true });
const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
