import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, clearSearch } from '../features/users/userSlice';
import { fetchExplorePosts } from '../features/posts/postSlice';
import UserCard from '../components/UserCard';
import PostList from '../components/PostList';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserSkeleton } from '../components/Skeleton';
import Icon from '../components/Icon';
import './Explore.css';

export default function Explore() {
  const dispatch = useDispatch();
  const { searchResults, searchStatus, suggestions, suggestionsStatus } = useSelector((state) => state.users);
  const explore = useSelector((state) => state.posts.explore);
  const [query, setQuery] = useState('');

  // Load recent posts once, and clear old search results when leaving the page.
  useEffect(() => {
    dispatch(fetchExplorePosts({ page: 1 }));
    return () => { dispatch(clearSearch()); };
  }, [dispatch]);

  // Search 350ms after the user stops typing (so we do not call the API on every key).
  useEffect(() => {
    const text = query.trim();
    if (!text) {
      dispatch(clearSearch());
      return undefined;
    }
    const timer = setTimeout(() => dispatch(searchUsers(text)), 350);
    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const searching = query.trim().length > 0;

  return (
    <div className="page">
      <h1 className="page-title">Explore</h1>

      <div className="glass search-box">
        <Icon name="search" />
        <label htmlFor="search" className="sr-only">Search people by name or username</label>
        <input id="search" type="search" placeholder="Search people by name or username" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />
        {searching && searchStatus === 'loading' && <LoadingSpinner size={18} label="Searching" />}
      </div>

      {searching ? (
        <section className="glass panel" aria-label="Search results">
          <h2 className="panel__title">People</h2>
          {searchStatus === 'loading' && searchResults.length === 0 && (<><UserSkeleton /><UserSkeleton /></>)}
          {searchStatus === 'failed' && <p className="muted">Search failed. Try again in a moment.</p>}
          {searchStatus === 'succeeded' && searchResults.length === 0 && (
            <EmptyState icon="search" title="No people found" message={`Nobody matches "${query.trim()}". Check the spelling or try a different name.`} />
          )}
          {searchResults.map((user) => <UserCard key={user._id} user={user} showBio />)}
        </section>
      ) : (
        <>
          <section className="glass panel" aria-label="Suggested accounts">
            <h2 className="panel__title">Suggested accounts</h2>
            {suggestionsStatus === 'loading' && suggestions.length === 0 && (<><UserSkeleton /><UserSkeleton /></>)}
            {suggestionsStatus === 'succeeded' && suggestions.length === 0 && <p className="muted">No new suggestions right now.</p>}
            {suggestions.map((user) => <UserCard key={user._id} user={user} showBio />)}
          </section>

          <h2 className="section-title">Recent posts</h2>
          <PostList
            list={explore}
            onRetry={() => dispatch(fetchExplorePosts({ page: 1 }))}
            onLoadMore={() => dispatch(fetchExplorePosts({ page: explore.page + 1 }))}
            empty={<EmptyState icon="compass" title="Nothing here yet" message="Be the first to post on Link Up." />}
          />
        </>
      )}
    </div>
  );
}
