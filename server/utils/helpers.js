const jwt = require('jsonwebtoken');

// Create a signed JWT that contains the user's id. It expires in 7 days.
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// True only for http:// or https:// URLs (used for image URLs).
const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

// A 24-character hex string looks like a MongoDB ObjectId.
const isObjectIdString = (value) => /^[a-f0-9]{24}$/i.test(value);

// Escape special characters so user input can be used safely inside a RegExp.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  generateToken,
  isValidUrl,
  isValidEmail,
  isObjectIdString,
  escapeRegex,
};
