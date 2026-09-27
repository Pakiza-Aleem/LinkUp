const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../utils/AppError');

// Where uploaded files live on disk, and the public URL prefix that serves them
// (server.js does: app.use('/uploads', express.static(UPLOAD_ROOT)) )
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Make sure the folders exist before multer tries to write into them.
const ensureUploadDirs = () => {
  ['avatars', 'posts'].forEach((folder) => {
    fs.mkdirSync(path.join(UPLOAD_ROOT, folder), { recursive: true });
  });
};

// Builds the storage engine for one subfolder ("avatars" or "posts").
const makeStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, subfolder)),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      cb(null, `${unique}${ALLOWED_TYPES[file.mimetype] || ''}`);
    },
  });

// Only accept real image files, and reject anything else with a clear message.
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
  cb(new AppError('Only JPG, PNG, WEBP or GIF images are allowed', 400));
};

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024, files: 1 }, // 4MB
});

const uploadPostImages = multer({
  storage: makeStorage('posts'),
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024, files: 5 }, // 6MB each, up to 5 files
});

// Turns a saved file into the public URL stored on the document.
const fileUrl = (req, subfolder, filename) => `${req.protocol}://${req.get('host')}/uploads/${subfolder}/${filename}`;

module.exports = { uploadAvatar, uploadPostImages, ensureUploadDirs, fileUrl, UPLOAD_ROOT };
