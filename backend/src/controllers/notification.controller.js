const Notification = require('../models/notification.model');

exports.getUnreadNotifications = async (req, res, next) => {
  try {
    const { anonymousId } = req.query; // Assuming anonymousId is passed as a query param or from middleware

    if (!anonymousId) {
      return res.status(400).json({ success: false, message: 'Anonymous ID is required.' });
    }

    const notifications = await Notification.find({ userId: anonymousId, read: false }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params; // Notification ID

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};
