const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Comment cannot be empty'],
        trim: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Comment must belong to a user'],
    },
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson',
        required: [true, 'Comment must belong to a lesson'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name role photo',
    });
    next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
