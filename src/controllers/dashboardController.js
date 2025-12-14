const Lesson = require('../models/lessonModel');
const Post = require('../models/postModel');
const Resource = require('../models/resourceModel');
const User = require('../models/userModel');

exports.getStats = async (req, res) => {
    try {
        const stats = {
            users: await User.countDocuments(),
            lessons: await Lesson.countDocuments(),
            posts: await Post.countDocuments(),
            resources: await Resource.countDocuments(),
            userDistribution: {
                student: await User.countDocuments({ role: 'student' }),
                teacher: await User.countDocuments({ role: 'teacher' }),
                admin: await User.countDocuments({ role: 'admin' }),
            }
        };

        res.status(200).json({
            status: 'success',
            data: { stats },
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
