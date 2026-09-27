import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { logout } from '../auth/authActions';

// ---------- Async actions ----------

// usernameOrId: works with "anna" or with a MongoDB id
export const fetchUserProfile = createAsyncThunk('users/fetchProfile', async (usernameOrId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/users/${usernameOrId}`);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateProfile = createAsyncThunk('users/updateProfile', async (changes, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/users/profile', changes);
    return data.user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const followUser = createAsyncThunk('users/follow', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/users/${userId}/follow`);
    return data; // { targetId, currentUserId, followersCount, followingCount }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const unfollowUser = createAsyncThunk('users/unfollow', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/users/${userId}/follow`);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const searchUsers = createAsyncThunk('users/search', async (query, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/search', { params: { q: query } });
    return data.users;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchSuggestions = createAsyncThunk('users/fetchSuggestions', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/suggestions');
    return data.users;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchFollowers = createAsyncThunk('users/fetchFollowers', async (usernameOrId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/users/${usernameOrId}/followers`);
    return data; // { user, users }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchFollowing = createAsyncThunk('users/fetchFollowing', async (usernameOrId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/users/${usernameOrId}/following`);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ---------- Slice ----------

const initialState = {
  // the profile page being viewed
  profile: null,
  profileStatus: 'idle', // idle | loading | succeeded | failed
  profileError: null,

  // "who to follow"
  suggestions: [],
  suggestionsStatus: 'idle',

  // search results
  searchResults: [],
  searchStatus: 'idle',
  searchQuery: '',

  // followers / following page
  connections: { user: null, users: [], status: 'idle', error: null },

  // edit profile form
  updateStatus: 'idle',
  updateError: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSearch(state) {
      state.searchResults = [];
      state.searchStatus = 'idle';
      state.searchQuery = '';
    },
    clearUpdateError(state) {
      state.updateError = null;
      state.updateStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // profile
      .addCase(fetchUserProfile.pending, (state) => { state.profileStatus = 'loading'; state.profileError = null; state.profile = null; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => { state.profileStatus = 'succeeded'; state.profile = action.payload; })
      .addCase(fetchUserProfile.rejected, (state, action) => { state.profileStatus = 'failed'; state.profileError = action.payload; })

      // edit profile
      .addCase(updateProfile.pending, (state) => { state.updateStatus = 'loading'; state.updateError = null; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const u = action.payload;
        if (state.profile && state.profile._id === u._id) {
          state.profile = { ...state.profile, name: u.name, username: u.username, bio: u.bio, profileImage: u.profileImage };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => { state.updateStatus = 'failed'; state.updateError = action.payload; })

      // follow / unfollow: update the counts shown on the profile page
      .addCase(followUser.fulfilled, (state, action) => {
        const { targetId, currentUserId, followersCount, followingCount } = action.payload;
        if (state.profile?._id === targetId) {
          state.profile.isFollowing = true;
          state.profile.followersCount = followersCount;
        }
        if (state.profile?._id === currentUserId) state.profile.followingCount = followingCount;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { targetId, currentUserId, followersCount, followingCount } = action.payload;
        if (state.profile?._id === targetId) {
          state.profile.isFollowing = false;
          state.profile.followersCount = followersCount;
        }
        if (state.profile?._id === currentUserId) state.profile.followingCount = followingCount;
      })

      // search (ignore answers to old queries that arrive late)
      .addCase(searchUsers.pending, (state, action) => { state.searchStatus = 'loading'; state.searchQuery = action.meta.arg; })
      .addCase(searchUsers.fulfilled, (state, action) => {
        if (action.meta.arg !== state.searchQuery) return;
        state.searchStatus = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        if (action.meta.arg !== state.searchQuery) return;
        state.searchStatus = 'failed';
      })

      // suggestions
      .addCase(fetchSuggestions.pending, (state) => { state.suggestionsStatus = 'loading'; })
      .addCase(fetchSuggestions.fulfilled, (state, action) => { state.suggestionsStatus = 'succeeded'; state.suggestions = action.payload; })
      .addCase(fetchSuggestions.rejected, (state) => { state.suggestionsStatus = 'failed'; })

      // followers + following share one "connections" state
      .addCase(fetchFollowers.pending, (state) => { state.connections = { user: null, users: [], status: 'loading', error: null }; })
      .addCase(fetchFollowers.fulfilled, (state, action) => { state.connections = { ...action.payload, status: 'succeeded', error: null }; })
      .addCase(fetchFollowers.rejected, (state, action) => { state.connections.status = 'failed'; state.connections.error = action.payload; })
      .addCase(fetchFollowing.pending, (state) => { state.connections = { user: null, users: [], status: 'loading', error: null }; })
      .addCase(fetchFollowing.fulfilled, (state, action) => { state.connections = { ...action.payload, status: 'succeeded', error: null }; })
      .addCase(fetchFollowing.rejected, (state, action) => { state.connections.status = 'failed'; state.connections.error = action.payload; })

      .addCase(logout, () => initialState);
  },
});

export const { clearSearch, clearUpdateError } = userSlice.actions;
export default userSlice.reducer;
