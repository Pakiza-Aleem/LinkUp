import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast } from '../features/ui/uiSlice';
import Icon from './Icon';
import './Toaster.css';

function Toast({ toast }) {
  const dispatch = useDispatch();

  // Each toast removes itself after 3.5 seconds.
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), 3500);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <Icon name={toast.type === 'error' ? 'alert' : 'check'} size={18} />
      <span>{toast.message}</span>
      <button className="icon-btn" onClick={() => dispatch(dismissToast(toast.id))} aria-label="Dismiss message">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

export default function Toaster() {
  const toasts = useSelector((state) => state.ui.toasts);
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((toast) => <Toast key={toast.id} toast={toast} />)}
    </div>
  );
}
