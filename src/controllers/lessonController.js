const Lesson = require('../models/lessonModel');

exports.getAllLessons = async (req, res) => {
    try {
        // Basic filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering (optional regex for search)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Lesson.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const lessons = await query;

        res.status(200).json({
            status: 'success',
            results: lessons.length,
            data: { lessons },
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.createLesson = async (req, res) => {
    try {
        // Add current user as instructor
        if (!req.body.instructor) req.body.instructor = req.user.id;

        const newLesson = await Lesson.create(req.body);

        // Create persistent notification
        const notificationController = require('./notificationController');
        await notificationController.createNotification({
            type: 'new_lesson',
            message: `New lesson: "${newLesson.title}" by ${req.user.name}`,
            link: `/dashboard/lessons/${newLesson._id}`,
            createdAt: Date.now()
        });

        // Notify all connected clients
        if (global.io) {
            global.io.emit('newLesson', {
                title: newLesson.title,
                id: newLesson._id,
                instructor: req.user.name
            });
        }

        res.status(201).json({
            status: 'success',
            data: { lesson: newLesson },
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate({
            path: 'instructor',
            select: 'name email',
        });

        if (!lesson) {
            return res.status(404).json({ status: 'fail', message: 'No lesson found with that ID' });
        }

        res.status(200).json({
            status: 'success',
            data: { lesson },
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!lesson) {
            return res.status(404).json({ status: 'fail', message: 'No lesson found with that ID' });
        }

        res.status(200).json({
            status: 'success',
            data: { lesson },
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({ status: 'fail', message: 'No lesson found with that ID' });
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ status: 'fail', message: 'No lesson found with that ID' });
        }

        const userId = req.user.id;
        const isLiked = lesson.likes.includes(userId);

        if (isLiked) {
            // Unlike
            lesson.likes = lesson.likes.filter(id => id.toString() !== userId);
        } else {
            // Like
            lesson.likes.push(userId);
        }

        await lesson.save();

        res.status(200).json({
            status: 'success',
            data: {
                likes: lesson.likes.length,
                isLiked: !isLiked
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
