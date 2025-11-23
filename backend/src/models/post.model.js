const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false, // Will be validated by custom schema validator
    trim: true,
    maxlength: 1000,
    validate: {
      validator: function(v) {
        // Simple profanity filter regex (can be extended)
        const profanityRegex = /badword|swearword|damn/i;
        return !profanityRegex.test(v);
      },
      message: 'Profanity is not allowed in post content.'
    }
  },
  media: {
    type: {
      image: { type: String, default: null },
      video: { type: String, default: null },
      audio: { type: String, default: null }
    },
    default: {}
  },
  likes: {
    type: [String],
    default: [],
  },
  reactions: {
    funny: { type: [String], default: [] },
    rage: { type: [String], default: [] },
    shock: { type: [String], default: [] },
    relatable: { type: [String], default: [] },
    love: { type: [String], default: [] },
    thinking: { type: [String], default: [] },
  },
  trending: {
    score: { type: Number, default: 0 },
    lastCalculated: { type: Date, default: Date.now },
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Custom validation: Post must contain at least content OR media
PostSchema.pre('validate', function(next) {
  if (!this.content && !this.media.image && !this.media.video && !this.media.audio) {
    this.invalidate('content', 'Post must contain either text content or media (image, video, or audio).', this.content);
  }
  next();
});

// Placeholder for calculateTrendingScore - will be properly implemented later
PostSchema.methods.calculateTrendingScore = function() {
  // For now, return a fixed number to prevent CastError: NaN
  this.trending.score = this.likes.length; // A simple example, replace with actual logic
  this.trending.lastCalculated = new Date();
};

// Placeholder for addReaction method
PostSchema.methods.addReaction = function(anonymousId, reactionType) {
  const validReactions = ['funny', 'rage', 'shock', 'relatable', 'love', 'thinking'];
  if (!validReactions.includes(reactionType)) {
    throw new Error('Invalid reaction type');
  }

  const reactionArray = this.reactions[reactionType];
  const userIndex = reactionArray.indexOf(anonymousId);

  if (userIndex > -1) {
    // User already reacted with this type, remove it (toggle off)
    reactionArray.splice(userIndex, 1);
  } else {
    // User has not reacted with this type, add it (toggle on)
    reactionArray.push(anonymousId);
  }

  this.calculateTrendingScore(); // Recalculate trending score after reaction
};

module.exports = mongoose.model("Post", PostSchema);
