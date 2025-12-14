const Comment = require('../models/commentModel');

exports.getAllComments = async (req, res) => {
    try {
        let filter = {};
        if (req.params.lessonId) filter = { lesson: req.params.lessonId };

        const comments = await Comment.find(filter).sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: comments.length,
            data: {
                comments,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.createComment = async (req, res) => {
    try {
        // Allow nested routes
        if (!req.body.lesson) req.body.lesson = req.params.lessonId;
        if (!req.body.user) req.body.user = req.user.id;

        const newComment = await Comment.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                comment: newComment,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                status: 'fail',
                message: 'No comment found with that ID',
            });
        }

        // Only author or admin/teacher can delete
        if (comment.user._id.toString() !== req.user.id && !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to delete this comment',
            });
        }

        await Comment.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};
