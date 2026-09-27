import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage, TOKEN_KEY } from '../../services/api';
import { logout } from './authActions';
import { followUser, unfollowUser, updateProfile } from '../users/userSlice';

// ---------- Async actions (createAsyncThunk) ----------

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem(TOKEN_KEY, data.token); // keep the user logged in after refresh
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Runs when the app starts: if a token is saved, ask the server who the user is.
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ---------- Slice ----------

const savedToken = localStorage.getItem(TOKEN_KEY);

const initialState = {
  token: savedToken,
  user: null, // the logged-in user (includes the ids they follow)
  status: 'idle', // status of login/register: idle | loading | failed
  error: null,
  // "initialized" becomes true once we know whether the saved token is valid.
  initialized: !savedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // register + login behave the same way
      .addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      .addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // app start-up
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // The token is invalid or expired: forget it.
        localStorage.removeItem(TOKEN_KEY);
        state.token = null;
        state.user = null;
        state.initialized = true;
      })

      // Keep the logged-in user's "following" list in sync with follow/unfollow.
      .addCase(followUser.fulfilled, (state, action) => {
        const id = action.payload.targetId;
        if (state.user && !state.user.following.includes(id)) state.user.following.push(id);
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        if (state.user) state.user.following = state.user.following.filter((id) => id !== action.payload.targetId);
      })
      // Keep name/username/bio/image in sync after editing the profile.
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })

      .addCase(logout, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'idle';
        state.error = null;
        state.initialized = true;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
