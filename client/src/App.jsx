import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/auth/authSlice';
import { logoutUser } from './features/auth/authActions';
import { showToast } from './features/ui/uiSlice';
import { TOKEN_KEY } from './services/api';

import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Toaster from './components/Toaster';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Followers from './pages/Followers';
import Following from './pages/Following';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const SPLASH_MIN_MS = 1300; // long enough for the logo animation to play once

export default function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [splash, setSplash] = useState('visible'); // visible -> leaving -> hidden

  // 1. On start-up: if a token is saved, check it with the server.
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) dispatch(fetchCurrentUser());
    const timer = setTimeout(() => setMinTimePassed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // 2. When the API says the token is no longer valid, log out.
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logoutUser());
      dispatch(showToast({ type: 'error', message: 'Your session expired. Please log in again.' }));
    };
    window.addEventListener('linkup:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('linkup:unauthorized', handleUnauthorized);
  }, [dispatch]);

  // 3. Fade the splash screen out once the app is ready.
  const ready = initialized && minTimePassed;
  useEffect(() => {
    if (!ready) return undefined;
    setSplash('leaving');
    const timer = setTimeout(() => setSplash('hidden'), 500);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <>
      {initialized && (
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Only for logged-out visitors */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Only for logged-in users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/followers/:username" element={<Followers />} />
              <Route path="/following/:username" element={<Following />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      )}

      <Toaster />
      {splash !== 'hidden' && <Splash leaving={splash === 'leaving'} />}
    </>
  );
}
