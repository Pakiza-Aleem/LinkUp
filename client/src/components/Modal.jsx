import { useEffect, useRef } from 'react';
import Icon from './Icon';
import './Modal.css';

// A centered glass dialog. Closes with the Esc key, the X button or a click outside.
export default function Modal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);
  // Keep the latest onClose in a ref so the effect below only runs when "open" changes.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden'; // stop the page scrolling behind the modal
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal glass glass--solid"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
