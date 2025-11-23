const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');

// POST /api/likes/toggle
router.post('/toggle', likeController.toggleLike);

module.exports = router;
