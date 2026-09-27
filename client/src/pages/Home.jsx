import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../features/posts/postSlice';
import CreatePost from '../components/CreatePost';
import PostList from '../components/PostList';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import './Home.css';

export default function Home() {
  const dispatch = useDispatch();
  const feed = useSelector((state) => state.posts.feed);

  useEffect(() => {
    dispatch(fetchFeed({ page: 1 }));
  }, [dispatch]);

  return (
    <div className="page">
      <h1 className="page-title">Home</h1>
      <CreatePost />
      {feed.suggested && feed.items.length > 0 && (
        <p className="feed-note">
          <Icon name="compass" size={16} />
          You are not following anyone yet, so here is what the community is sharing. <Link to="/explore">Find people to follow</Link>
        </p>
      )}
      <PostList
        list={feed}
        onRetry={() => dispatch(fetchFeed({ page: 1 }))}
        onLoadMore={() => dispatch(fetchFeed({ page: feed.page + 1 }))}
        empty={
          <EmptyState icon="users" title="Your feed is quiet" message="Share your first post, or follow people to see what they are posting.">
            <Link className="btn btn--primary btn--sm" to="/explore">Find people to follow</Link>
          </EmptyState>
        }
      />
    </div>
  );
}
