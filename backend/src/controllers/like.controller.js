const Post = require('../models/post.model');
const Notification = require('../models/notification.model'); // Import Notification model

exports.toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.body;
    // In an anonymous system, we'll use a unique identifier from the request,
    // perhaps derived from a session or a temporary anonymous user ID.
    // For this implementation, we'll assume req.anonymousId is available from a middleware.
    const { anonymousId } = req.body; // Or from a decoded JWT, session, etc.

    if (!postId || !anonymousId) {
      return res.status(400).json({ success: false, message: 'Post ID and anonymous ID are required.' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const likedIndex = post.likes.indexOf(anonymousId);

    if (likedIndex > -1) {
      // User already liked, so unlike
      post.likes.splice(likedIndex, 1);
    } else {
      // User has not liked, so like
      post.likes.push(anonymousId);
    }

    await post.save();

    // Create notification for post owner if liked
    if (likedIndex === -1) { // If it was a new like
      // Assuming post has an anonymousId field for the owner
      if (post.anonymousId !== anonymousId) { // Don't notify if user likes their own post
        await Notification.create({
          userId: post.anonymousId,
          type: 'like',
          sourceUser: anonymousId,
          postId: post._id,
        });
      }
    }

    res.status(200).json({ success: true, likesCount: post.likes.length, isLiked: likedIndex === -1 });
  } catch (error) {
    next(error);
  }
};
