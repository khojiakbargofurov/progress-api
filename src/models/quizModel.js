const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A quiz must have a title'],
        trim: true,
    },
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson',
        required: [true, 'A quiz must belong to a lesson'],
    },
    questions: [
        {
            question: {
                type: String,
                required: [true, 'A question must have text'],
            },
            options: {
                type: [String],
                validate: {
                    validator: function (val) {
                        return val.length >= 2;
                    },
                    message: 'A question must have at least 2 options',
                },
            },
            correctOption: {
                type: Number,
                required: [true, 'A question must have a correct option index'],
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
