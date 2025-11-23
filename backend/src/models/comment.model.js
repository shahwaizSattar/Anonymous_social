const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  anonymousId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Comment cannot be empty.'],
    maxlength: [500, 'Comment cannot exceed 500 characters.'],
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Comment', CommentSchema);
