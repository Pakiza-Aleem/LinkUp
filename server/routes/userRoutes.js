const express = require('express');
const {
  getUserProfile,
  updateProfile,
  searchUsers,
  getSuggestions,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // every user route needs a logged-in user

// Fixed paths must come BEFORE "/:id", otherwise Express treats "search" as an id.
router.get('/search', searchUsers);
router.get('/suggestions', getSuggestions);
router.put('/profile', uploadAvatar.single('profileImage'), updateProfile);

router.get('/:id', getUserProfile);
router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
