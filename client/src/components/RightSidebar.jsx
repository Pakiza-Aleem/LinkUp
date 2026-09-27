import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestions } from '../features/users/userSlice';
import UserCard from './UserCard';
import { UserSkeleton } from './Skeleton';
import Icon from './Icon';
import './RightSidebar.css';

// Right column on desktop: "Who to follow".
export default function RightSidebar() {
  const dispatch = useDispatch();
  const { suggestions, suggestionsStatus } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  return (
    <aside className="right-sidebar" aria-label="Suggestions">
      <section className="glass panel">
        <div className="panel__header">
          <h2>Who to follow</h2>
          <button className="icon-btn" onClick={() => dispatch(fetchSuggestions())} aria-label="Show different suggestions">
            <Icon name="refresh" size={18} />
          </button>
        </div>

        {suggestionsStatus === 'loading' && suggestions.length === 0 && (<><UserSkeleton /><UserSkeleton /><UserSkeleton /></>)}
        {suggestionsStatus === 'failed' && <p className="muted">Suggestions are unavailable right now.</p>}
        {suggestionsStatus === 'succeeded' && suggestions.length === 0 && (
          <p className="muted">You follow everyone here. Invite a friend to Link Up.</p>
        )}
        {suggestions.map((user) => <UserCard key={user._id} user={user} />)}
      </section>
      <p className="muted right-sidebar__footer">Link Up &middot; Connect. Share. Belong.</p>
    </aside>
  );
}
