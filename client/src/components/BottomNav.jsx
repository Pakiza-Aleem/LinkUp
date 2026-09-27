import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { openCreatePost } from '../features/ui/uiSlice';
import Icon from './Icon';
import './BottomNav.css';

// Bottom tab bar for phones. The centre button opens the "Create post" dialog.
export default function BottomNav() {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const linkClass = ({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`;

  return (
    <nav className="bottom-nav glass" aria-label="Main navigation">
      <NavLink to="/home" className={linkClass}><Icon name="home" /><span>Home</span></NavLink>
      <NavLink to="/explore" className={linkClass}><Icon name="search" /><span>Search</span></NavLink>
      <button className="bottom-nav__create" onClick={() => dispatch(openCreatePost())} aria-label="Create post">
        <Icon name="plus" size={24} />
      </button>
      <NavLink to={`/profile/${me.username}`} className={linkClass}><Icon name="user" /><span>Profile</span></NavLink>
      <NavLink to="/settings" className={linkClass}><Icon name="settings" /><span>Settings</span></NavLink>
    </nav>
  );
}
