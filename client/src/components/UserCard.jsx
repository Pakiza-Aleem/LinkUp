import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import './UserCard.css';

// One row in a list of people: avatar, name, @username and a follow button.
export default function UserCard({ user, showBio = false }) {
  return (
    <div className="user-card">
      <Link to={`/profile/${user.username}`} className="user-card__link" aria-label={`View ${user.name}'s profile`}>
        <Avatar user={user} size={44} />
        <span className="user-card__text">
          <strong>{user.name}</strong>
          <span className="muted">@{user.username}</span>
          {showBio && user.bio && <span className="user-card__bio">{user.bio}</span>}
        </span>
      </Link>
      <FollowButton userId={user._id} />
    </div>
  );
}
