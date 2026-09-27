import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import postReducer from '../features/posts/postSlice';
import commentReducer from '../features/comments/commentSlice';
import uiReducer from '../features/ui/uiSlice';

// The single Redux store for the whole app.
// Each key below becomes a part of the global state: state.auth, state.users ...
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    posts: postReducer,
    comments: commentReducer,
    ui: uiReducer,
  },
});

export default store;
