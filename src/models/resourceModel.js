const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A resource must have a title'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['pdf', 'link', 'video', 'guide'],
        required: [true, 'A resource must have a type'],
    },
    url: {
        type: String,
        required: [true, 'A resource must have a URL'],
    },
    category: {
        type: String,
        required: [true, 'A resource must have a category'],
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
