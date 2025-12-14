const Message = require('../models/messageModel');
const User = require('../models/userModel');

exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: {
                messages
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getUsersWithChat = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select('name username avatar role email');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};
