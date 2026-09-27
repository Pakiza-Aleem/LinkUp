const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // load variables from .env

const connectDB = require('./config/db');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { postCommentsRouter, commentRouter } = require('./routes/commentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { ensureUploadDirs, UPLOAD_ROOT } = require('./middleware/uploadMiddleware');
const seedDatabase = require('./seed');

// Fail early with a clear message if the required settings are missing.
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

ensureUploadDirs(); // create uploads/avatars and uploads/posts if they don't exist yet

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_ROOT)); // serves uploaded avatar/post images

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Link Up API' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts/:postId/comments', postCommentsRouter);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // First run with an empty database: add demo people and posts so the feed,
  // explore page and search are never empty for a brand-new account.
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('No users found, adding demo data...');
    await seedDatabase();
  }
  app.listen(PORT, () => console.log(`Link Up API running on http://localhost:${PORT}`));
});
