import { createSlice, nanoid } from '@reduxjs/toolkit';
import { logout } from '../auth/authActions';

// UI-only state: toast messages and the "Create post" modal.
const initialState = {
  toasts: [], // [{ id, type: 'success' | 'error', message }]
  createPostOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      // "prepare" lets us generate a unique id for each toast
      prepare({ type = 'success', message }) {
        return { payload: { id: nanoid(), type, message } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openCreatePost(state) { state.createPostOpen = true; },
    closeCreatePost(state) { state.createPostOpen = false; },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { showToast, dismissToast, openCreatePost, closeCreatePost } = uiSlice.actions;
export default uiSlice.reducer;
