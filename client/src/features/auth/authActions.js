import { createAction } from '@reduxjs/toolkit';
import { TOKEN_KEY } from '../../services/api';

// A plain action that other slices listen to so they can reset their data on logout.
export const logout = createAction('auth/logout');

// Logging out = remove the saved token + reset the Redux state.
export const logoutUser = () => (dispatch) => {
  localStorage.removeItem(TOKEN_KEY);
  dispatch(logout());
};
