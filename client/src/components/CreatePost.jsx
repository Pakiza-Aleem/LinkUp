import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, clearCreateError } from '../features/posts/postSlice';
import { showToast } from '../features/ui/uiSlice';
import Avatar from './Avatar';
import Button from './Button';
import Alert from './Alert';
import ImageDropzone from './ImageDropzone';
import './CreatePost.css';

const MAX_LENGTH = 1000;

// The "what's on your mind" box. onSuccess is optional (used to close the modal).
export default function CreatePost({ onSuccess }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const { createStatus, createError } = useSelector((state) => state.posts);

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // real File objects, previewed by ImageDropzone
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    dispatch(clearCreateError());

    if (!content.trim() && images.length === 0) {
      return setLocalError('Write something or add a photo before posting.');
    }

    const body = new FormData();
    body.append('content', content);
    images.forEach((file) => body.append('images', file));

    try {
      await dispatch(createPost(body)).unwrap();
      setContent('');
      setImages([]);
      dispatch(showToast({ message: 'Your post is live' }));
      if (onSuccess) onSuccess();
    } catch (error) {
      // the message is already saved in Redux (createError) and shown below
    }
  };

  const submitting = createStatus === 'loading';
  const errorMessage = localError || createError;

  return (
    <form className="glass create-post" onSubmit={handleSubmit}>
      <div className="create-post__top">
        <Avatar user={me} size={44} />
        <div className="create-post__field">
          <label htmlFor="post-content" className="sr-only">What's on your mind?</label>
          <textarea
            id="post-content"
            placeholder={`What's on your mind, ${me.name.split(' ')[0]}?`}
            rows={3}
            maxLength={MAX_LENGTH}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>
      </div>

      <ImageDropzone files={images} onChange={setImages} />

      {errorMessage && <Alert>{errorMessage}</Alert>}

      <div className="create-post__footer">
        <span className="muted" aria-live="polite">{content.length}/{MAX_LENGTH}</span>
        <Button type="submit" loading={submitting}>{submitting ? 'Posting' : 'Post'}</Button>
      </div>
    </form>
  );
}
