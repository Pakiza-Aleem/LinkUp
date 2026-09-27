import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../../services/api';
import { logout } from '../auth/authActions';

// ---------- Async actions ----------

export const fetchComments = createAsyncThunk('comments/fetch', async (postId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return { postId, comments: data.comments };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addComment = createAsyncThunk('comments/add', async ({ postId, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/posts/${postId}/comments`, { text });
    return data.comment;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteComment = createAsyncThunk('comments/delete', async (commentId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/comments/${commentId}`);
    return data; // { commentId, postId }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ---------- Slice ----------

// Comments are grouped by post id:
// byPost = { "<postId>": { items: [...], status: 'loading' | 'succeeded' | 'failed', error } }
const initialState = { byPost: {} };

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        const postId = action.meta.arg;
        state.byPost[postId] = { items: state.byPost[postId]?.items || [], status: 'loading', error: null };
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.byPost[action.payload.postId] = { items: action.payload.comments, status: 'succeeded', error: null };
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const postId = action.meta.arg;
        state.byPost[postId] = { items: [], status: 'failed', error: action.payload };
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const comment = action.payload;
        const entry = state.byPost[comment.post] || { items: [], status: 'succeeded', error: null };
        entry.items.push(comment);
        state.byPost[comment.post] = entry;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId, postId } = action.payload;
        if (state.byPost[postId]) {
          state.byPost[postId].items = state.byPost[postId].items.filter((c) => c._id !== commentId);
        }
      })
      .addCase(logout, () => initialState);
  },
});

export default commentSlice.reducer;
