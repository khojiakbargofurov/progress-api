const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A post must have a title'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'A post must have content'],
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A post must have an author'],
    },
    category: {
        type: String,
        enum: ['tech', 'lifestyle', 'education', 'news'],
        default: 'tech',
    },
    coverImage: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
