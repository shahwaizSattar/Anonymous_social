const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');

// POST /api/comments
router.post('/', commentController.addComment);

// DELETE /api/comments/:id
router.delete('/:id', commentController.deleteComment);

module.exports = router;
