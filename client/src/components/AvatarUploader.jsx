import { useRef, useState } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';
import './AvatarUploader.css';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB, matches the server's multer limit

// A round avatar with a camera button overlay. Picking a file shows an instant
// local preview (via a temporary object URL); nothing is uploaded until the
// surrounding form is submitted.
export default function AvatarUploader({ name, previewUser, existingImage, onFileSelected, onRemove, error }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState('');

  const handlePick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // lets the same file be picked again later
    if (!file) return;

    if (!file.type.startsWith('image/')) return setLocalError('Please choose an image file');
    if (file.size > MAX_SIZE) return setLocalError('That image is larger than 4MB');

    setLocalError('');
    setPreview(URL.createObjectURL(file));
    onFileSelected(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setLocalError('');
    if (onRemove) onRemove();
  };

  const displayUser = preview
    ? { ...previewUser, profileImage: preview }
    : { ...previewUser, profileImage: existingImage };

  return (
    <div className="avatar-uploader">
      <div className="avatar-uploader__ring">
        <Avatar user={displayUser} size={88} />
        <button type="button" className="avatar-uploader__pick" onClick={() => inputRef.current?.click()} aria-label="Choose a profile picture">
          <Icon name="image" size={16} />
        </button>
        {(preview || existingImage) && (
          <button type="button" className="avatar-uploader__remove" onClick={handleRemove} aria-label="Remove profile picture">
            <Icon name="close" size={13} />
          </button>
        )}
      </div>
      <label htmlFor={name} className="sr-only">Profile picture</label>
      <input ref={inputRef} id={name} name={name} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePick} className="sr-only" />
      <p className="muted avatar-uploader__hint">JPG, PNG, WEBP or GIF, up to 4MB</p>
      {(localError || error) && <p className="field__error">{localError || error}</p>}
    </div>
  );
}
