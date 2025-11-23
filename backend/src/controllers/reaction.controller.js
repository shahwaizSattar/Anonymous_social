const Post = require('../models/post.model');

exports.toggleReaction = async (req, res, next) => {
  try {
    const { postId, anonymousId, reactionType } = req.body;

    if (!postId || !anonymousId || !reactionType) {
      return res.status(400).json({ success: false, message: 'Post ID, anonymous ID, and reaction type are required.' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.addReaction(anonymousId, reactionType);
    await post.save();

    res.status(200).json({ success: true, reactions: post.reactions });
  } catch (error) {
    next(error);
  }
};
