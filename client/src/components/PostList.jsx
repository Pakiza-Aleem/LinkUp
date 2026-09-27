import PostCard from './PostCard';
import { PostSkeleton } from './Skeleton';
import EmptyState from './EmptyState';
import Alert from './Alert';
import Button from './Button';
import './PostList.css';

// Shows a list of posts together with its loading, error, empty and "load more" states.
// "list" is one of the paginated lists from the post slice (feed / explore / userPosts).
export default function PostList({ list, onLoadMore, onRetry, empty }) {
  const { items, status, error, hasMore, loadingMore } = list;

  if (status === 'loading' || status === 'idle') {
    return <div className="post-list"><PostSkeleton /><PostSkeleton /><PostSkeleton /></div>;
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <div className="glass panel">
        <Alert>{error}</Alert>
        <Button variant="ghost" onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="glass panel">{empty}</div>;
  }

  return (
    <div className="post-list">
      {items.map((post) => <PostCard key={post._id} post={post} />)}
      {error && <Alert>{error}</Alert>}
      {hasMore && (
        <Button variant="ghost" className="load-more" onClick={onLoadMore} loading={loadingMore}>Load more posts</Button>
      )}
    </div>
  );
}
