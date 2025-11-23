const Comment = require('../models/comment.model');
const Post = require('../models/post.model'); // Assuming Post model is needed to link comments
const Notification = require('../models/notification.model'); // Import Notification model

// Add a comment to a post
exports.addComment = async (req, res, next) => {
  try {
    const { postId, anonymousId, text } = req.body;

    if (!postId || !anonymousId || !text) {
      return res.status(400).json({ success: false, message: 'All fields (postId, anonymousId, text) are required.' });
    }

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = await Comment.create({
      postId,
      anonymousId,
      text,
    });

    // Create notification for post owner
    if (postExists.anonymousId !== anonymousId) { // Don't notify if user comments on their own post
      await Notification.create({
        userId: postExists.anonymousId,
        type: 'comment',
        sourceUser: anonymousId,
        postId: postExists._id,
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error); // Pass error to centralized error handling
  }
};

// Delete a comment (restricted to owner)
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params; // Comment ID
    const { anonymousId } = req.body; // Anonymous ID of the user trying to delete

    if (!anonymousId) {
      return res.status(401).json({ success: false, message: 'Anonymous ID is required for deletion.' });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    // Check if the anonymousId matches the owner of the comment
    if (comment.anonymousId !== anonymousId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    await comment.deleteOne(); // Use deleteOne() or findByIdAndDelete() based on Mongoose version

    res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    next(error); // Pass error to centralized error handling
  }
};
