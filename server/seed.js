// Demo data so a brand-new install never shows an empty feed, search or explore page.
// Runs automatically once, the first time the server starts against an empty database
// (see server.js). Can also be run by hand:   npm run seed
//
// Demo accounts all use the password: password123
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const demoUsers = [
  { name: 'Amara Okafor', username: 'amara', email: 'amara@linkup.test', bio: 'Photographer. Coffee first, everything else after.' },
  { name: 'Leo Martins', username: 'leo', email: 'leo@linkup.test', bio: 'Building small, useful things on the web.' },
  { name: 'Mei Tanaka', username: 'mei', email: 'mei@linkup.test', bio: 'Hiking on weekends, ramen on weekdays.' },
  { name: 'Sam Rivera', username: 'sam', email: 'sam@linkup.test', bio: 'Always up for a good conversation.' },
  { name: 'Priya Nair', username: 'priya', email: 'priya@linkup.test', bio: 'Product designer. Sketchbooks everywhere.' },
  { name: 'Noah Becker', username: 'noah', email: 'noah@linkup.test', bio: 'Runs a small pottery studio downtown.' },
  { name: 'Zara Hassan', username: 'zara', email: 'zara@linkup.test', bio: 'Studying astrophysics, thinking about the sea.' },
  { name: 'Diego Morales', username: 'diego', email: 'diego@linkup.test', bio: 'Home cook. Currently obsessed with sourdough.' },
];

const demoPosts = [
  { user: 'amara', content: 'Golden hour over the rooftops today. Some light is worth waiting around for.' },
  { user: 'amara', content: 'Finally printed my favourite shots from last spring. There is something about holding a photo instead of scrolling past it.' },
  { user: 'leo', content: 'Shipped my first full-stack project this weekend. Small win, but it felt huge.' },
  { user: 'leo', content: 'Debugging for three hours to find a missing semicolon. Worth it, apparently.' },
  { user: 'mei', content: 'Sunday trail, ramen after. About as good as a day gets.' },
  { user: 'mei', content: 'Started a new notebook today. There is a strange kind of joy in the first blank page.' },
  { user: 'sam', content: 'Had the best conversation with a stranger at the bus stop about absolutely nothing important. Loved it.' },
  { user: 'priya', content: 'Redesigned my portfolio for the fourth time this year. Version five is coming, probably.' },
  { user: 'priya', content: 'A good sketch is worth a thousand meetings.' },
  { user: 'noah', content: 'Glazed a new batch of mugs this morning. Half of them are already spoken for.' },
  { user: 'zara', content: 'Spent the evening reading about deep sea creatures instead of studying for my astrophysics exam. No regrets.' },
  { user: 'diego', content: 'Day 12 of the sourdough starter. We are calling him Gerald now.' },
  { user: 'diego', content: 'Made pasta completely from scratch for the first time. My arms are tired, my dinner was excellent.' },
  { user: 'sam', content: 'Reminder to yourself: send that message you have been putting off.' },
  { user: 'noah', content: 'Small studio, big mess, good day.' },
];

const demoComments = [
  { user: 'leo', onPostIndex: 0, text: 'This is stunning, what time did you get out there?' },
  { user: 'mei', onPostIndex: 0, text: 'The colors in this are unreal.' },
  { user: 'sam', onPostIndex: 2, text: 'Congrats! What did you build?' },
  { user: 'priya', onPostIndex: 4, text: 'Adding this trail to my list immediately.' },
  { user: 'diego', onPostIndex: 11, text: 'Gerald deserves his own account honestly.' },
  { user: 'amara', onPostIndex: 11, text: 'Following Gerald\'s journey closely.' },
];

const seedDatabase = async () => {
  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) await mongoose.connect(process.env.MONGO_URI);

  // Only ever touch previously-seeded demo accounts, never real user data.
  const oldDemoUsers = await User.find({ email: /@linkup\.test$/ }).select('_id');
  const oldIds = oldDemoUsers.map((u) => u._id);
  await Comment.deleteMany({ author: { $in: oldIds } });
  await Post.deleteMany({ author: { $in: oldIds } });
  await User.deleteMany({ email: /@linkup\.test$/ });

  const usersByUsername = {};
  for (const data of demoUsers) {
    usersByUsername[data.username] = await User.create({ ...data, password: 'password123' });
  }

  // A handful of follow relationships, so the demo network doesn't feel scattered.
  const follow = async (fromUsername, toUsernames) => {
    const from = usersByUsername[fromUsername];
    for (const toUsername of toUsernames) {
      const to = usersByUsername[toUsername];
      await User.updateOne({ _id: from._id }, { $addToSet: { following: to._id } });
      await User.updateOne({ _id: to._id }, { $addToSet: { followers: from._id } });
    }
  };
  await follow('amara', ['leo', 'mei', 'priya']);
  await follow('leo', ['amara', 'sam', 'noah']);
  await follow('mei', ['amara', 'zara']);
  await follow('sam', ['leo', 'diego']);
  await follow('priya', ['amara', 'noah', 'zara']);

  const createdPosts = [];
  for (const { user, content } of demoPosts) {
    createdPosts.push(await Post.create({ author: usersByUsername[user]._id, content }));
  }

  for (const { user, onPostIndex, text } of demoComments) {
    await Comment.create({ post: createdPosts[onPostIndex]._id, author: usersByUsername[user]._id, text });
  }

  console.log(`Seeded ${demoUsers.length} demo users, ${demoPosts.length} posts and ${demoComments.length} comments.`);
  console.log('Demo login: any username above, password "password123" (e.g. amara / password123)');

  if (shouldDisconnect) await mongoose.disconnect();
};

module.exports = seedDatabase;

// Allows running this file directly:   npm run seed
if (require.main === module) {
  require('dotenv').config();
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
