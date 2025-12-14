const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['global', 'personal', 'new_lesson', 'new_post'],
        default: 'personal' // or specific types like 'new_lesson'
    },
    message: {
        type: String,
        required: [true, 'Notification must have a message']
    },
    link: {
        type: String // URL to redirect to
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // If personal
    },
    readBy: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for performance
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
