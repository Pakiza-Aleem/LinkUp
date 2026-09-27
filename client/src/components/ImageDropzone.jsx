import { useRef, useState } from 'react';
import Icon from './Icon';
import './ImageDropzone.css';

const MAX_SIZE = 6 * 1024 * 1024; // 6MB, matches the server's multer limit
const MAX_FILES = 5;

// Lets someone add up to 5 photos to a post: click to browse, or drag files in.
// "files" / "onChange" hold the real File objects; previews are generated locally.
export default function ImageDropzone({ files, onChange, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList);
    const accepted = [];
    let message = '';

    for (const file of incoming) {
      if (files.length + accepted.length >= MAX_FILES) { message = `You can add up to ${MAX_FILES} photos`; break; }
      if (!file.type.startsWith('image/')) { message = 'Only image files are allowed'; continue; }
      if (file.size > MAX_SIZE) { message = 'Each photo must be smaller than 6MB'; continue; }
      accepted.push(file);
    }

    setLocalError(message);
    if (accepted.length) onChange([...files, ...accepted]);
  };

  const handlePick = (event) => {
    if (event.target.files?.length) addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  };

  const removeAt = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div className="dropzone-wrap">
      {files.length > 0 && (
        <ul className="dropzone-previews">
          {files.map((file, index) => (
            <li key={file.name + file.size + index}>
              <img src={URL.createObjectURL(file)} alt={`Photo ${index + 1} to attach`} />
              <button type="button" className="icon-btn dropzone-previews__remove" onClick={() => removeAt(index)} aria-label={`Remove photo ${index + 1}`}>
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length < MAX_FILES && (
        <button
          type="button"
          className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Icon name="image" size={20} />
          <span>{files.length === 0 ? 'Add photos' : 'Add more'}</span>
          <span className="muted dropzone__hint">Click or drag images here</span>
        </button>
      )}

      <label htmlFor="post-images" className="sr-only">Add photos to your post</label>
      <input ref={inputRef} id="post-images" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={handlePick} className="sr-only" />

      {(localError || error) && <p className="field__error">{localError || error}</p>}
    </div>
  );
}
