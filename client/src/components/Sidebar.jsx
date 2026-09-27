import { NavLink, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authActions';
import { openCreatePost } from '../features/ui/uiSlice';
import Logo from './Logo';
import Icon from './Icon';
import Avatar from './Avatar';
import './Sidebar.css';

// Left column on desktop: main navigation.
export default function Sidebar() {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const { pathname } = useLocation();

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`;
  const connectionsActive = pathname.startsWith('/followers/') || pathname.startsWith('/following/');

  return (
    <aside className="sidebar glass" aria-label="Main navigation">
      <Link to="/home" className="sidebar__brand" aria-label="Link Up home">
        <Logo size={38} showText />
      </Link>

      <nav className="sidebar__nav">
        <NavLink to="/home" className={linkClass}><Icon name="home" /> Home</NavLink>
        <NavLink to="/explore" className={linkClass}><Icon name="compass" /> Explore</NavLink>
        <button className="nav-link" onClick={() => dispatch(openCreatePost())}><Icon name="plus" /> Create post</button>
        <NavLink to={`/profile/${me.username}`} className={linkClass}><Icon name="user" /> Profile</NavLink>
        <NavLink to={`/followers/${me.username}`} className={() => `nav-link ${connectionsActive ? 'nav-link--active' : ''}`}>
          <Icon name="users" /> Followers &amp; following
        </NavLink>
        <NavLink to="/settings" className={linkClass}><Icon name="settings" /> Settings</NavLink>
      </nav>

      <div className="sidebar__footer">
        <Link to={`/profile/${me.username}`} className="sidebar__me">
          <Avatar user={me} size={38} />
          <span>
            <strong>{me.name}</strong>
            <span className="muted">@{me.username}</span>
          </span>
        </Link>
        <button className="nav-link nav-link--logout" onClick={() => dispatch(logoutUser())}>
          <Icon name="logout" /> Log out
        </button>
      </div>
    </aside>
  );
}
