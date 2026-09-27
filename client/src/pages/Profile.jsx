import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, clearUpdateError } from '../features/users/userSlice';
import { fetchUserPosts } from '../features/posts/postSlice';
import { monthYear } from '../utils/formatDate';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import FollowButton from '../components/FollowButton';
import PostList from '../components/PostList';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import EditProfileForm from '../components/EditProfileForm';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = useSelector((state) => state.auth.user);
  const { profile, profileStatus, profileError } = useSelector((state) => state.users);
  const userPosts = useSelector((state) => state.posts.userPosts);
  const [editing, setEditing] = useState(false);

  // Load the profile whenever the username in the URL changes.
  useEffect(() => {
    dispatch(fetchUserProfile(username));
  }, [dispatch, username]);

  // Once we know the user's id, load their posts.
  const profileId = profile?._id;
  useEffect(() => {
    if (profileId) dispatch(fetchUserPosts({ userId: profileId, page: 1 }));
  }, [dispatch, profileId]);

  if (profileStatus === 'failed') {
    return (
      <div className="page">
        <div className="glass panel">
          <Alert>{profileError}</Alert>
          <Link to="/home" className="btn btn--ghost">Back to home</Link>
        </div>
      </div>
    );
  }

  // Show a loading card until the profile that matches the URL has arrived.
  // (Exception: right after we rename ourselves the URL is briefly out of date.)
  const urlIsStale = profile && profile.username !== username.toLowerCase();
  const justRenamed = urlIsStale && profile._id === me._id;
  if (!profile || (urlIsStale && !justRenamed)) {
    return (
      <div className="page">
        <div className="glass profile-card profile-card--loading"><LoadingSpinner label="Loading profile" /></div>
      </div>
    );
  }

  const isMe = profile._id === me._id;

  // After a username change the URL must change too.
  const handleSaved = (updated) => {
    setEditing(false);
    dispatch(clearUpdateError());
    if (updated.username !== username.toLowerCase()) navigate(`/profile/${updated.username}`, { replace: true });
  };

  return (
    <div className="page">
      <section className="glass profile-card">
        <div className="profile-card__cover" aria-hidden="true" />
        <div className="profile-card__body">
          <div className="profile-card__top">
            <Avatar user={profile} size={104} className="profile-card__avatar" />
            <div className="profile-card__actions">
              {isMe ? (
                <Button variant="ghost" onClick={() => setEditing(true)}>Edit profile</Button>
              ) : (
                <FollowButton userId={profile._id} size="md" />
              )}
            </div>
          </div>

          <h1 className="profile-card__name">{profile.name}</h1>
          <p className="muted">@{profile.username} &middot; Joined {monthYear(profile.createdAt)}</p>
          <p className="profile-card__bio">{profile.bio || (isMe ? 'Add a short bio from Edit profile.' : 'No bio yet.')}</p>

          <dl className="stats">
            <div className="stat"><dt>Posts</dt><dd>{profile.postsCount}</dd></div>
            <Link className="stat stat--link" to={`/followers/${profile.username}`}><dt>Followers</dt><dd>{profile.followersCount}</dd></Link>
            <Link className="stat stat--link" to={`/following/${profile.username}`}><dt>Following</dt><dd>{profile.followingCount}</dd></Link>
          </dl>
        </div>
      </section>

      <h2 className="section-title">Posts</h2>
      <PostList
        list={userPosts}
        onRetry={() => dispatch(fetchUserPosts({ userId: profile._id, page: 1 }))}
        onLoadMore={() => dispatch(fetchUserPosts({ userId: profile._id, page: userPosts.page + 1 }))}
        empty={<EmptyState icon="image" title="No posts yet" message={isMe ? 'Share your first post from the Home page.' : `@${profile.username} has not posted anything yet.`} />}
      />

      <Modal open={editing} title="Edit profile" onClose={() => { setEditing(false); dispatch(clearUpdateError()); }}>
        <EditProfileForm onSaved={handleSaved} />
      </Modal>
    </div>
  );
}
