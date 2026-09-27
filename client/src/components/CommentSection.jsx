import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchComments, addComment, deleteComment } from '../features/comments/commentSlice';
import { showToast } from '../features/ui/uiSlice';
import { timeAgo, fullDate } from '../utils/formatDate';
import Avatar from './Avatar';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';
import './CommentSection.css';

// The expandable comments area inside a post card.
export default function CommentSection({ postId }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const entry = useSelector((state) => state.comments.byPost[postId]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // Load the comments when the section opens.
  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await dispatch(addComment({ postId, text })).unwrap();
      setText('');
    } catch (message) {
      dispatch(showToast({ type: 'error', message }));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await dispatch(deleteComment(commentId)).unwrap();
    } catch (message) {
      dispatch(showToast({ type: 'error', message }));
    }
  };

  const comments = entry?.items || [];

  return (
    <section className="comments" aria-label="Comments">
      {(!entry || entry.status === 'loading') && comments.length === 0 && <LoadingSpinner size={22} label="Loading comments" />}
      {entry?.status === 'failed' && <Alert>{entry.error}</Alert>}
      {entry?.status === 'succeeded' && comments.length === 0 && (
        <p className="muted comments__empty">No comments yet. Start the conversation.</p>
      )}

      <ul className="comments__list">
        {comments.map((comment) => (
          <li key={comment._id} className="comment">
            <Link to={`/profile/${comment.author.username}`}><Avatar user={comment.author} size={32} /></Link>
            <div className="comment__body">
              <div className="comment__meta">
                <Link to={`/profile/${comment.author.username}`}><strong>{comment.author.username}</strong></Link>
                <time className="muted" dateTime={comment.createdAt} title={fullDate(comment.createdAt)}>{timeAgo(comment.createdAt)}</time>
              </div>
              <p>{comment.text}</p>
            </div>
            {comment.author._id === me._id && (
              <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(comment._id)} aria-label="Delete your comment">
                <Icon name="trash" size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>

      <form className="comment-form" onSubmit={handleSubmit}>
        <label htmlFor={`comment-${postId}`} className="sr-only">Write a comment</label>
        <input
          id={`comment-${postId}`}
          type="text"
          placeholder="Write a comment..."
          value={text}
          maxLength={500}
          onChange={(event) => setText(event.target.value)}
        />
        <button className="btn btn--primary btn--sm" type="submit" disabled={sending || !text.trim()}>
          {sending ? 'Sending' : 'Reply'}
        </button>
      </form>
    </section>
  );
}
