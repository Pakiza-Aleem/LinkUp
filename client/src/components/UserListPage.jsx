import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowers, fetchFollowing } from '../features/users/userSlice';
import UserCard from './UserCard';
import EmptyState from './EmptyState';
import Alert from './Alert';
import { UserSkeleton } from './Skeleton';
import './UserListPage.css';

// Shared by the Followers page and the Following page.  type: "followers" | "following"
export default function UserListPage({ type }) {
  const dispatch = useDispatch();
  const { username } = useParams();
  const { user, users, status, error } = useSelector((state) => state.users.connections);
  const isFollowers = type === 'followers';

  useEffect(() => {
    dispatch(isFollowers ? fetchFollowers(username) : fetchFollowing(username));
  }, [dispatch, username, isFollowers]);

  return (
    <div className="page">
      <div className="glass panel">
        <div className="page-heading">
          <h1>{isFollowers ? 'Followers' : 'Following'}</h1>
          <Link to={`/profile/${username}`} className="muted">Back to @{username}</Link>
        </div>

        <div className="tabs" role="tablist" aria-label="Connections">
          <Link to={`/followers/${username}`} role="tab" aria-selected={isFollowers} className={`tab ${isFollowers ? 'tab--active' : ''}`}>Followers</Link>
          <Link to={`/following/${username}`} role="tab" aria-selected={!isFollowers} className={`tab ${!isFollowers ? 'tab--active' : ''}`}>Following</Link>
        </div>

        {status === 'loading' && (<><UserSkeleton /><UserSkeleton /><UserSkeleton /></>)}
        {status === 'failed' && <Alert>{error}</Alert>}

        {status === 'succeeded' && users.length === 0 && (
          <EmptyState
            icon="users"
            title={isFollowers ? 'No followers yet' : 'Not following anyone yet'}
            message={isFollowers ? `When people follow @${user?.username || username}, they will appear here.` : 'Find people on the Explore page and follow them to fill the feed.'}
          >
            {!isFollowers && <Link className="btn btn--primary btn--sm" to="/explore">Find people</Link>}
          </EmptyState>
        )}

        {status === 'succeeded' && users.map((person) => <UserCard key={person._id} user={person} showBio />)}
      </div>
    </div>
  );
}
