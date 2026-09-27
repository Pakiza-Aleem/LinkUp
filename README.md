# Link Up

> **Connect. Share. Belong.**

Link Up is a full-stack social media platform built with the MERN stack (MongoDB, Express, React, Node.js) for the CodeAlpha internship, Project 1: Social Media Platform. People can register, build a profile, follow each other, post text and images, like and comment, search for users, and read a feed made of their own circle.

The whole interface follows one design system: **Dark Emerald Glassmorphism** (dark forest background, emerald accents, frosted glass panels, Inter typeface).

---

## Features

- Register and log in (JWT, bcrypt-hashed passwords, session survives a page refresh)
- Protected routes and a splash screen on start-up
- User profiles: picture, name, username, bio, posts / followers / following counts
- Edit profile (name, username, bio, profile image URL)
- Follow / unfollow, followers list, following list (stored in MongoDB, UI updates instantly)
- Create posts with text and up to 5 image URLs, with image previews
- Multi-image posts use a **React Slick** carousel (arrows + dots)
- Social feed: your posts + posts from people you follow, newest first, "Load more" pagination
- Like / unlike (the server prevents duplicate likes)
- Comments: add, view, delete your own
- Delete your own posts (the server refuses anyone else)
- Search users by name or username
- Explore page: suggested accounts + recent posts from everyone
- "Who to follow" suggestions (never yourself, never people you already follow)
- Loading skeletons, empty states, error messages and toast notifications
- Responsive: 3-column desktop layout; top bar + bottom tab bar on phones

## Technology Stack

| Part | Technology |
|------|-----------|
| Frontend | React 18, JavaScript, Vite, React Router DOM, Redux Toolkit (`createSlice`, `createAsyncThunk`), Axios, React Slick + Slick Carousel, plain CSS (one file per component) |
| Backend | Node.js, Express, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `dotenv`, `cors`, `multer` |
| Database | MongoDB Atlas |

No Tailwind, Bootstrap, Material UI, Next.js, TypeScript, Firebase or Context API. The icons are small inline SVGs (`components/Icon.jsx`) and the logo is an original SVG (`components/Logo.jsx`, `public/favicon.svg`). The only package added beyond the brief's list is **`multer`**, used to handle real image uploads (see below).

### Real file uploads (Multer)

Profile pictures and post photos are uploaded as actual files, not pasted links:

- `server/middleware/uploadMiddleware.js` configures two Multer instances: `uploadAvatar` (single file, 4MB limit) and `uploadPostImages` (up to 5 files, 6MB each). Both only accept JPG/PNG/WEBP/GIF and write to `server/uploads/avatars` or `server/uploads/posts` with a unique generated filename.
- `server.js` serves that folder publicly at `/uploads/...` and creates the folders on startup if they don't exist yet.
- Register, Edit Profile and Create Post send `multipart/form-data` (built with `FormData` in the browser); Multer parses the file(s) and Express keeps reading the text fields exactly as before.
- Uploaded files stay on the server's disk and are **not** committed to git (`server/uploads/*` is git-ignored, with `.gitkeep` placeholders so the empty folders exist after cloning).

### Custom CSS, one file per component

Instead of one large stylesheet, every component and page owns its own `.css` file next to it (e.g. `PostCard.jsx` + `PostCard.css`), imported directly at the top of that file. Two small shared files cover only truly cross-cutting rules: `styles/tokens.css` (colors, reset, typography, utility classes like `.glass`/`.icon-btn`) and `styles/animations.css` (keyframes reused by more than one component), both loaded once in `main.jsx`.

### A feed that is never empty

The server auto-seeds a small set of demo people and posts the very first time it starts against an empty database (see "Demo data" below), and a brand-new account that hasn't followed anyone yet sees a "Suggested for you" feed of recent community posts instead of a blank Home page.

## Folder Structure

```
link-up/
├── README.md
├── server/
│   ├── config/db.js                 MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        register, login, me
│   │   ├── userController.js        profile, search, follow, followers, suggestions
│   │   ├── postController.js        create, feed, explore, delete, like
│   │   └── commentController.js     list, add, delete comments
│   ├── middleware/
│   │   ├── authMiddleware.js        protect(): checks the JWT
│   │   ├── uploadMiddleware.js      Multer config for avatar / post image uploads
│   │   └── errorMiddleware.js       notFound + one central error handler (incl. Multer errors)
│   ├── models/                      User.js, Post.js, Comment.js
│   ├── routes/                      authRoutes, userRoutes, postRoutes, commentRoutes
│   ├── utils/                       AppError, asyncHandler, helpers
│   ├── uploads/                     avatars/ and posts/ - uploaded image files (git-ignored)
│   ├── seed.js                      demo data (auto-runs once on an empty database)
│   ├── server.js                    app entry point
│   ├── .env.example
│   └── package.json
└── client/
    ├── public/favicon.svg
    ├── index.html
    └── src/
        ├── app/store.js             Redux store
        ├── features/
        │   ├── auth/                authSlice.js, authActions.js
        │   ├── users/               userSlice.js
        │   ├── posts/               postSlice.js
        │   ├── comments/            commentSlice.js
        │   └── ui/                  uiSlice.js (toasts, create-post dialog)
        ├── services/api.js          Axios instance + error helper
        ├── components/              reusable UI, each with its own .css file (Button.jsx + Button.css, PostCard.jsx + PostCard.css, ...)
        ├── pages/                   Splash, Login, Register, Home, Explore, Profile, Followers, Following, Settings - each with its own .css where needed
        ├── styles/                  tokens.css (design tokens, reset, utilities) + animations.css (shared keyframes), loaded once
        ├── utils/formatDate.js
        ├── App.jsx                  routes + splash logic
        └── main.jsx                 React entry
```

## Requirements

- Node.js 18 or newer (`node -v`)
- npm (comes with Node)
- A free MongoDB Atlas account
- Git (optional)

## Installation

### Backend setup

If you are using this folder as it is, install the dependencies:

```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

If you want to build the backend from scratch instead, the equivalent commands are:

```bash
mkdir server && cd server
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

Scripts in `server/package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js"
}
```

### Frontend setup

Using this folder as it is:

```bash
cd client
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Building the frontend from scratch instead:

```bash
npm create vite@latest client      # choose: React, then JavaScript
cd client
npm install
npm install react-router-dom axios @reduxjs/toolkit react-redux react-slick slick-carousel
```

## MongoDB Atlas Setup

1. Go to <https://www.mongodb.com/cloud/atlas> and create a free account.
2. Create a **project**, then click **Create** (or **Build a Database**) and choose the free **M0** tier. Pick the region closest to you.
3. **Database Access** (left menu) > **Add New Database User**. Choose *Password* authentication, enter a username and password, and give it *Read and write to any database*. Write the password down. If it contains special characters such as `@` or `#`, URL-encode them or pick a simpler password.
4. **Network Access** > **Add IP Address**. For development choose **Allow Access From Anywhere** (`0.0.0.0/0`), or **Add Current IP Address**.
5. **Database** > **Connect** > **Drivers**. Copy the connection string. It looks like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the user from step 3, and add the database name before the `?`:
   ```
   mongodb+srv://myUser:myPassword@cluster0.abcde.mongodb.net/linkup?retryWrites=true&w=majority
   ```
   The `linkup` database and its collections are created automatically the first time data is saved.
7. Paste this as `MONGO_URI` in `server/.env`.

## Environment Variables

**`server/.env`** (never commit this file)

| Variable | Meaning |
|----------|---------|
| `PORT` | Port for the API. Default `5000` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string used to sign tokens |
| `CLIENT_URL` | Where the React app runs (for CORS). `http://localhost:5173` |

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**`client/.env`**

| Variable | Meaning |
|----------|---------|
| `VITE_API_URL` | API base URL. `http://localhost:5000/api` |

## Running the Project

Open **two terminals**.

```bash
# Terminal 1 - API
cd server
npm run dev
# expected: "MongoDB connected: ..." and "Link Up API running on http://localhost:5000"
```

```bash
# Terminal 2 - React app
cd client
npm run dev
# open http://localhost:5173
```

### Demo data

The first time you start the API against a brand-new, empty database, it automatically seeds 8 demo accounts, ~15 posts and some comments and follow relationships — so the feed, Explore page and search are never empty. You'll see this in the API's terminal:

```
No users found, adding demo data...
Seeded 8 demo users, 15 posts and 6 comments.
Demo login: any username above, password "password123" (e.g. amara / password123)
```

Demo usernames: `amara`, `leo`, `mei`, `sam`, `priya`, `noah`, `zara`, `diego` — all with password `password123`.

This only runs once, when the `users` collection is empty. To re-seed later by hand (this replaces only the demo accounts, never real ones you registered):

```bash
cd server
npm run seed
```

Everything else in the app works with real registered users; the seed data is purely a starting point so a fresh install doesn't look empty.

Production build of the frontend: `cd client && npm run build`.

## API Reference

All routes except register/login need the header `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in with email or username |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users/search?q=` | Search by name/username |
| GET | `/api/users/suggestions` | People to follow |
| PUT | `/api/users/profile` | Edit own profile |
| GET | `/api/users/:id` | Profile (`:id` can be an id or a username) |
| POST / DELETE | `/api/users/:id/follow` | Follow / unfollow |
| GET | `/api/users/:id/followers` | Followers list |
| GET | `/api/users/:id/following` | Following list |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/feed?page=` | Feed (me + people I follow) |
| GET | `/api/posts/explore?page=` | Recent posts from everyone |
| GET | `/api/posts/user/:userId?page=` | One user's posts |
| GET | `/api/posts/:id` | Single post |
| DELETE | `/api/posts/:id` | Delete own post (403 otherwise) |
| POST / DELETE | `/api/posts/:id/like` | Like / unlike |
| GET / POST | `/api/posts/:postId/comments` | List / add comments |
| DELETE | `/api/comments/:id` | Delete own comment (403 otherwise) |

Errors always look like `{ "message": "Readable explanation" }` with a proper status code (400, 401, 403, 404, 409, 500).

## How It Works (viva notes)

- **Authentication flow.** `register`/`login` return a JWT. The frontend saves it in `localStorage`, and the Axios request interceptor (`services/api.js`) adds it to every request as `Authorization: Bearer ...`. On the server, `protect` (`authMiddleware.js`) verifies the token and puts the user in `req.user`. When the page reloads, `App.jsx` calls `fetchCurrentUser` to restore the session.
- **Passwords.** Hashed with bcrypt in the `User` model's `pre('save')` hook. The `password` field has `select: false` and `toJSON` removes it, so it is never sent to the browser.
- **Relationships.** `User.followers` and `User.following` are arrays of user ids. Following someone updates both users using `$addToSet` (no duplicates); unfollowing uses `$pull`.
- **Likes.** `Post.likes` is an array of user ids updated with `$addToSet`, so the *database* prevents duplicate likes.
- **Comments.** A separate `Comment` collection references `post` and `author`. Comment counts are calculated with an aggregation instead of being stored twice.
- **Authorization.** Deleting a post or comment compares `author` with `req.user._id` on the server and answers 403 if they differ.
- **Redux.** Five slices: `auth`, `users`, `posts`, `comments`, `ui`. Every API call is a `createAsyncThunk`. Slices react to each other's thunks with `extraReducers` (for example `followUser.fulfilled` updates both the logged-in user and the profile counts).
- **Splash screen.** Shown while the saved token is being checked, for at least ~1.3 seconds so the logo animation can finish, then it fades out.

## Testing Checklist

Run the API and the client, then tick each item. Use two browsers (or one normal + one private window) with two accounts, A and B.

**Accounts**
- [ ] Splash screen shows the logo and "Connect. Share. Belong." then fades into the login page
- [ ] Register with an empty field / bad email / short password shows a clear message
- [ ] Register account A succeeds and lands on Home
- [ ] Registering again with the same email, or the same username, shows an error
- [ ] Log out, then log in with the email; log out and log in with the username
- [ ] Wrong password shows "Invalid email/username or password"
- [ ] Refresh the page while logged in: you stay logged in
- [ ] Visit `/home` while logged out: redirected to `/login`; visit `/login` while logged in: redirected to `/home`

**Profile and follow**
- [ ] Profile page shows picture (or initial), name, @username, bio and the three counts
- [ ] Edit profile (name, bio, image URL, username) saves and the page updates; a taken username is rejected
- [ ] As B, search for A by name and by username; results show Follow buttons
- [ ] Follow A: button becomes "Following", A's follower count goes up without refreshing
- [ ] A's Followers page lists B; B's Following page lists A
- [ ] Unfollow: counts go back down
- [ ] Your own profile has no Follow button (the API also answers 400 if you try `POST /api/users/<your id>/follow`)

**Posts, likes, comments**
- [ ] Create a text post; it appears at the top of the feed
- [ ] Create a post with one image URL (preview shows before posting)
- [ ] Create a post with 3 image URLs: the card shows a carousel with arrows and dots
- [ ] B sees A's posts in the feed only after following A
- [ ] Like and unlike: the heart and count change; refreshing keeps the state
- [ ] Add a comment; the comment count increases; delete your own comment
- [ ] Delete your own post (confirmation dialog); B has no delete button on A's posts
- [ ] Authorization check: `DELETE /api/posts/<A's post id>` with B's token returns 403 (same for comments)
- [ ] Explore shows recent posts and suggested accounts; searching a nonsense name shows "No people found"
- [ ] Empty states appear for a new account: empty feed, no followers, no following, no posts

**Responsive and quality**
- [ ] Desktop: sidebar, feed and suggestions are all visible
- [ ] Narrow the window below ~820px: top bar + bottom tab bar appear; the centre "+" opens the Create post sheet
- [ ] Tab through the app with the keyboard: focus outlines are visible
- [ ] Browser console shows no errors during the steps above
- [ ] MongoDB Atlas > Browse Collections shows the `users`, `posts` and `comments` collections with your data

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing MONGO_URI or JWT_SECRET` | Create `server/.env` from `.env.example` |
| `MongoDB connection failed` | Check the username/password in the URI, and that your IP is allowed in Network Access |
| Browser shows a CORS error | `CLIENT_URL` in `server/.env` must exactly match the address of the React app |
| "Cannot reach the server" toast | Start the API (`npm run dev` in `server`) and check `VITE_API_URL` |
| Images do not show | Use a direct image link (ends in .jpg/.png, or opens as only an image) |

## License

Built for educational purposes as part of the CodeAlpha internship program.
