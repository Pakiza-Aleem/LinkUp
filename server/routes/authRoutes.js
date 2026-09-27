const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

const router = express.Router();

// uploadAvatar.single('profileImage') reads the optional avatar file, if any,
// and leaves the other text fields on req.body exactly like a normal form post.
router.post('/register', uploadAvatar.single('profileImage'), register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
