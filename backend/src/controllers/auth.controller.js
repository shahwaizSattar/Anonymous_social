const { User, generateDisplayName } = require('../../src/models/user.model');
const crypto = require('crypto');

// Generate a random alphanumeric string for anonymousId
const generateAnonymousId = () => {
  return crypto.randomBytes(8).toString('hex'); // 16 characters
};

// Register an anonymous user
exports.registerAnonymousUser = async (req, res) => {
  let anonymousId;
  let user;
  let collision = true;
  let attempts = 0;
  const MAX_ATTEMPTS = 5; // Prevent infinite loops

  while (collision && attempts < MAX_ATTEMPTS) {
    anonymousId = generateAnonymousId();
    const existingUser = await User.findOne({ anonymousId });
    if (!existingUser) {
      collision = false;
    } else {
      attempts++;
    }
  }

  if (collision) {
    return res.status(500).json({ success: false, message: 'Could not generate a unique anonymous ID after several attempts.' });
  }

  const displayName = generateDisplayName();

  try {
    user = await User.create({
      anonymousId,
      displayName,
    });
    res.status(201).json({ success: true, user: { anonymousId: user.anonymousId, displayName: user.displayName } });
  } catch (error) {
    console.error('Error during anonymous user registration:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};
