const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    unique: true,
    // Alphanumeric validation
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9]+$/.test(v);
      },
      message: props => `${props.value} is not alphanumeric!`
    }
  },
  displayName: {
    type: String,
    required: true,
    // Minimum 5 characters validation
    minlength: [5, 'Display name must be at least 5 characters long']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deviceToken: {
    type: String,
    required: false
  }
});

// Helper function to generate a display name
UserSchema.statics.generateDisplayName = function() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `User${randomNumber}`;
};

const User = mongoose.model('User', UserSchema);

module.exports = { User, generateDisplayName: UserSchema.statics.generateDisplayName };
