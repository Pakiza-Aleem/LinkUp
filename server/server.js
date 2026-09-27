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

// ------------------------------------
// Check required environment variables
// ------------------------------------

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error(
    'Missing MONGO_URI or JWT_SECRET environment variables.'
  );
  process.exit(1);
}

// ------------------------------------
// Create Express app
// ------------------------------------

const app = express();

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

// Create upload folders for local development
ensureUploadDirs();

// Serve uploaded files
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
// API Routes
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
// Railway PORT
// ------------------------------------

const PORT = process.env.PORT || 5000;

// ------------------------------------
// Start server
// ------------------------------------

const startServer = async () => {
  try {
    await connectDB();

    // Seed demo data only when enabled
    if (process.env.SEED_DATABASE === 'true') {
      const userCount = await User.countDocuments();

      if (userCount === 0) {
        console.log('No users found, adding demo data...');
        await seedDatabase();
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Link Up API running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();