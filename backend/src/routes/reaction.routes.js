const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reaction.controller');

// POST /api/reactions/toggle
router.post('/toggle', reactionController.toggleReaction);

module.exports = router;
