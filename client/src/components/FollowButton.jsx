import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser } from '../features/users/userSlice';
import { showToast } from '../features/ui/uiSlice';
import Button from './Button';

// Follow / Unfollow button. It reads the logged-in user's "following" list from Redux,
// so every button on the page updates instantly after one click.
export default function FollowButton({ userId, size = 'sm' }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const [busy, setBusy] = useState(false);

  if (!me || me._id === userId) return null; // never show it for yourself

  const isFollowing = me.following.includes(userId);

  const handleClick = async () => {
    setBusy(true);
    try {
      await dispatch(isFollowing ? unfollowUser(userId) : followUser(userId)).unwrap();
    } catch (message) {
      dispatch(showToast({ type: 'error', message }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant={isFollowing ? 'ghost' : 'primary'} size={size} loading={busy} onClick={handleClick} aria-pressed={isFollowing}>
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
