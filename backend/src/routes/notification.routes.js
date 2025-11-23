const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// GET /api/notifications/unread
router.get('/unread', notificationController.getUnreadNotifications);

// PATCH /api/notifications/read/:id
router.patch('/read/:id', notificationController.markAsRead);

module.exports = router;
