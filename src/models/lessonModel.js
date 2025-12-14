const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A lesson must have a title'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    videoUrl: {
        type: String,
        required: [true, 'A lesson must have a video URL'],
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'A lesson must have a duration'],
    },
    category: {
        type: String,
        required: [true, 'A lesson must belong to a category'],
        enum: {
            values: ['programming', 'english', 'productivity', 'design', 'other'],
            message: 'Category is either: programming, english, productivity, design, other',
        },
    },
    tags: [String],
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A lesson must belong to an instructor'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
