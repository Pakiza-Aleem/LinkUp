const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const {
  postCommentsRouter,
  commentRouter
} = require('./routes/commentRoutes');

const {
  notFound,
  errorHandler
} = require('./middleware/errorMiddleware');

const {
  ensureUploadDirs,
  UPLOAD_ROOT
} = require('./middleware/uploadMiddleware');

const seedDatabase = require('./seed');

const app = express();

// ------------------------------------
// Environment variables
// ------------------------------------

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error(
    'Missing MONGO_URI or JWT_SECRET environment variables.'
  );
}

// ------------------------------------
// Middleware
// ------------------------------------

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());

// Local uploads for development
// NOTE: For Vercel production, use Cloudinary or another
// persistent storage service for uploaded images.
ensureUploadDirs();

app.use('/uploads', express.static(UPLOAD_ROOT));

// ------------------------------------
// Health check
// ------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Link Up API'
  });
});

// ------------------------------------
// Routes
// ------------------------------------

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use(
  '/api/posts/:postId/comments',
  postCommentsRouter
);

app.use('/api/posts', postRoutes);

app.use('/api/comments', commentRouter);

// ------------------------------------
// Error handling
// ------------------------------------

app.use(notFound);

app.use(errorHandler);

// ------------------------------------
// MongoDB connection
// ------------------------------------

let dbConnected = false;

const connectDatabase = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;

    // Seed only when explicitly enabled.
    if (process.env.SEED_DATABASE === 'true') {
      const userCount = await User.countDocuments();

      if (userCount === 0) {
        console.log('No users found, adding demo data...');
        await seedDatabase();
      }
    }
  }
};

// ------------------------------------
// Vercel serverless handler
// ------------------------------------

module.exports = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Server error:', error);

    return res.status(500).json({
      message: 'Server error'
    });
  }
};