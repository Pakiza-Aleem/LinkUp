import axios from 'axios';

export const TOKEN_KEY = 'linkup_token';

// One Axios instance used by every Redux thunk.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Before every request, attach the JWT (if the user is logged in).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is no longer valid, tell the app to log out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event('linkup:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Turns any Axios error into a message that is safe and readable for the user.
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return 'Cannot reach the server. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
};

export default api;
