const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token for the given user ID.
 * @param {string} id - MongoDB User _id
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Sends a standardized auth response with token and user data.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} user - Mongoose user document
 */
const sendTokenResponse = (res, statusCode, user) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

module.exports = { generateToken, sendTokenResponse };
