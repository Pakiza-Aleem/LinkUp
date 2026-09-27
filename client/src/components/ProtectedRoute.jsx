import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages inside this route need a logged-in user, otherwise go to /login.
export default function ProtectedRoute() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// Login/Register pages: logged-in users are sent back into the app.
export function GuestRoute() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (user) return <Navigate to={location.state?.from?.pathname || '/home'} replace />;
  return <Outlet />;
}
