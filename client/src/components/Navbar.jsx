import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from './Logo';
import Icon from './Icon';
import Avatar from './Avatar';
import './Navbar.css';

// Compact top bar shown on tablets and phones (the sidebar replaces it on desktop).
export default function Navbar() {
  const me = useSelector((state) => state.auth.user);

  return (
    <header className="topbar glass">
      <Link to="/home" aria-label="Link Up home"><Logo size={32} showText /></Link>
      <div className="topbar__actions">
        <Link to="/explore" className="icon-btn" aria-label="Search people"><Icon name="search" /></Link>
        <Link to={`/profile/${me.username}`} aria-label="Your profile"><Avatar user={me} size={34} /></Link>
      </div>
    </header>
  );
}
