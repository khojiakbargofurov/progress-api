const Lesson = require('../models/lessonModel');
const Post = require('../models/postModel');
const Resource = require('../models/resourceModel');

exports.search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ status: 'fail', message: 'Please provide a search term' });
        }

        const regex = new RegExp(q, 'i');

        const [lessons, posts, resources] = await Promise.all([
            Lesson.find({ $or: [{ title: regex }, { description: regex }] }),
            Post.find({ $or: [{ title: regex }, { content: regex }] }),
            Resource.find({ title: regex }),
        ]);

        res.status(200).json({
            status: 'success',
            results: lessons.length + posts.length + resources.length,
            data: {
                lessons,
                posts,
                resources,
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
