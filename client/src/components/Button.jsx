import LoadingSpinner from './LoadingSpinner';
import './Button.css';

// variant: "primary" | "ghost" | "danger"     size: "md" | "sm"
export default function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoadingSpinner size={16} label="" />}
      {children}
    </button>
  );
}
