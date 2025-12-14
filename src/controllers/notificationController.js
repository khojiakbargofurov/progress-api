const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        // Find notifications that are:
        // 1. Global (type 'new_lesson' etc intended for all)
        // 2. Personal sent to this user
        // AND not read by this user yet? Or just list all and show read status?
        // Let's show all latest 50, client handles read styling.

        const filter = {
            $or: [
                { type: { $in: ['global', 'new_lesson', 'new_post'] } },
                { recipient: req.user.id }
            ]
        };

        const notifications = await Notification.find(filter)
            .sort('-createdAt')
            .limit(50);

        // Map to add 'isRead' flag for convenience
        const result = notifications.map(notif => ({
            ...notif.toObject(),
            isRead: notif.readBy.some(id => id.toString() === req.user.id)
        }));

        res.status(200).json({
            status: 'success',
            results: result.length,
            data: {
                notifications: result
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ status: 'fail', message: 'No notification found' });
        }

        // Add user to readBy if not already there
        if (!notification.readBy.includes(req.user.id)) {
            notification.readBy.push(req.user.id);
            await notification.save();
        }

        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Internal helper to create notification
exports.createNotification = async (data) => {
    try {
        await Notification.create(data);
    } catch (err) {
        console.error('Failed to create notification', err);
    }
};
