const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['follow', 'like', 'comment', 'reaction'], // Added 'reaction' for completeness
  },
  sourceUser: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
