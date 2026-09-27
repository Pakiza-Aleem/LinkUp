import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { likePost, unlikePost, deletePost } from '../features/posts/postSlice';
import { showToast } from '../features/ui/uiSlice';
import { timeAgo, fullDate } from '../utils/formatDate';
import Avatar from './Avatar';
import Icon from './Icon';
import ImageCarousel from './ImageCarousel';
import CommentSection from './CommentSection';
import Modal from './Modal';
import Button from './Button';
import './PostCard.css';

// One post in the feed / explore / profile.
export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const [showComments, setShowComments] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);

  const isOwner = post.author._id === me._id;
  const liked = post.likes.includes(me._id);

  const handleLike = async () => {
    setLiking(true);
    try {
      await dispatch(liked ? unlikePost(post._id) : likePost(post._id)).unwrap();
    } catch (message) {
      dispatch(showToast({ type: 'error', message }));
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deletePost(post._id)).unwrap();
      dispatch(showToast({ message: 'Post deleted' }));
    } catch (message) {
      dispatch(showToast({ type: 'error', message }));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <article className="glass post-card">
      <header className="post-card__header">
        <Link to={`/profile/${post.author.username}`} className="post-card__author">
          <Avatar user={post.author} size={44} />
          <span>
            <strong>{post.author.name}</strong>
            <span className="muted">
              @{post.author.username} &middot;{' '}
              <time dateTime={post.createdAt} title={fullDate(post.createdAt)}>{timeAgo(post.createdAt)}</time>
            </span>
          </span>
        </Link>
        {isOwner && (
          <button className="icon-btn icon-btn--danger" onClick={() => setConfirmDelete(true)} aria-label="Delete this post">
            <Icon name="trash" size={18} />
          </button>
        )}
      </header>

      {post.content && <p className="post-card__content">{post.content}</p>}

      <ImageCarousel images={post.images} author={post.author.username} />

      <footer className="post-card__actions">
        <button
          className={`action-btn ${liked ? 'action-btn--liked' : ''}`}
          onClick={handleLike}
          disabled={liking}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike this post' : 'Like this post'}
        >
          <Icon name="heart" size={20} filled={liked} />
          <span>{post.likes.length}</span>
        </button>
        <button
          className={`action-btn ${showComments ? 'action-btn--active' : ''}`}
          onClick={() => setShowComments((open) => !open)}
          aria-expanded={showComments}
          aria-label={showComments ? 'Hide comments' : 'Show comments'}
        >
          <Icon name="comment" size={20} />
          <span>{post.commentsCount}</span>
        </button>
      </footer>

      {showComments && <CommentSection postId={post._id} />}

      <Modal open={confirmDelete} title="Delete this post?" onClose={() => !deleting && setConfirmDelete(false)}>
        <p className="muted">This will permanently remove the post and its comments.</p>
        <div className="modal__actions">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete post</Button>
        </div>
      </Modal>
    </article>
  );
}
