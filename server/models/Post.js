const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, trim: true, maxlength: [1000, 'Post cannot be longer than 1000 characters'], default: '' },
    images: { type: [String], default: [] }, // image URLs
    // Each user id can appear only once (the controller uses $addToSet).
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
