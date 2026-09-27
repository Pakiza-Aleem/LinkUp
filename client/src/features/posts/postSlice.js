import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { logout } from '../auth/authActions';
import { addComment, deleteComment } from '../comments/commentSlice';

// ---------- Async actions ----------

// Feed = my posts + posts from people I follow (paginated)
export const fetchFeed = createAsyncThunk('posts/fetchFeed', async ({ page = 1 } = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/posts/feed', { params: { page } });
    return data; // { posts, page, hasMore }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Explore = recent posts from everyone
export const fetchExplorePosts = createAsyncThunk('posts/fetchExplore', async ({ page = 1 } = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/posts/explore', { params: { page } });
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Posts written by one user (shown on the profile page)
export const fetchUserPosts = createAsyncThunk('posts/fetchUserPosts', async ({ userId, page = 1 }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/posts/user/${userId}`, { params: { page } });
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createPost = createAsyncThunk('posts/create', async (postData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/posts', postData);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deletePost = createAsyncThunk('posts/delete', async (postId, { rejectWithValue }) => {
  try {
    await api.delete(`/posts/${postId}`);
    return postId;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const likePost = createAsyncThunk('posts/like', async (postId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/like`);
    return data; // { postId, likes }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const unlikePost = createAsyncThunk('posts/unlike', async (postId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/posts/${postId}/like`);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ---------- Slice ----------

const emptyList = { items: [], status: 'idle', error: null, page: 1, hasMore: false, loadingMore: false };

const initialState = {
  // "suggested" is true when the feed had to fall back to community posts
  // because the account does not follow anyone yet.
  feed: { ...emptyList, suggested: false },
  explore: { ...emptyList },
  userPosts: { ...emptyList, userId: null },
  createStatus: 'idle',
  createError: null,
};

const LIST_KEYS = ['feed', 'explore', 'userPosts'];

// The same post can appear in several lists (feed, explore, profile).
// This helper applies a change to it everywhere.
const updatePostEverywhere = (state, postId, updateFn) => {
  LIST_KEYS.forEach((key) => {
    const post = state[key].items.find((p) => p._id === postId);
    if (post) updateFn(post);
  });
};

// Adds the loading / success / failure handling for one paginated list.
const addListCases = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      const list = state[key];
      const page = action.meta.arg?.page || 1;
      if (page === 1) {
        list.status = 'loading';
        list.items = [];
        if (key === 'userPosts') list.userId = action.meta.arg.userId;
      } else {
        list.loadingMore = true;
      }
      list.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      const list = state[key];
      const { posts, page, hasMore } = action.payload;
      if (key === 'userPosts' && list.userId !== action.meta.arg.userId) return; // stale answer
      list.items = page === 1 ? posts : [...list.items, ...posts.filter((p) => !list.items.some((x) => x._id === p._id))];
      list.page = page;
      list.hasMore = hasMore;
      list.status = 'succeeded';
      list.loadingMore = false;
      if ('suggested' in action.payload) list.suggested = action.payload.suggested;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].status = 'failed';
      state[key].loadingMore = false;
      state[key].error = action.payload;
    });
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCreateError(state) {
      state.createError = null;
      state.createStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    addListCases(builder, fetchFeed, 'feed');
    addListCases(builder, fetchExplorePosts, 'explore');
    addListCases(builder, fetchUserPosts, 'userPosts');

    builder
      .addCase(createPost.pending, (state) => { state.createStatus = 'loading'; state.createError = null; })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        const post = action.payload;
        state.feed.items.unshift(post); // newest first
        state.explore.items.unshift(post);
        if (state.userPosts.userId === post.author._id) state.userPosts.items.unshift(post);
      })
      .addCase(createPost.rejected, (state, action) => { state.createStatus = 'failed'; state.createError = action.payload; })

      .addCase(deletePost.fulfilled, (state, action) => {
        LIST_KEYS.forEach((key) => {
          state[key].items = state[key].items.filter((p) => p._id !== action.payload);
        });
      })

      // likes: the server returns the full list of user ids who liked the post
      .addCase(likePost.fulfilled, (state, action) => {
        updatePostEverywhere(state, action.payload.postId, (post) => { post.likes = action.payload.likes; });
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        updatePostEverywhere(state, action.payload.postId, (post) => { post.likes = action.payload.likes; });
      })

      // comments change the comment counter shown on the post card
      .addCase(addComment.fulfilled, (state, action) => {
        updatePostEverywhere(state, action.payload.post, (post) => { post.commentsCount += 1; });
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        updatePostEverywhere(state, action.payload.postId, (post) => { post.commentsCount = Math.max(0, post.commentsCount - 1); });
      })

      .addCase(logout, () => initialState);
  },
});

export const { clearCreateError } = postSlice.actions;
export default postSlice.reducer;
