import './LoadingSpinner.css';
// The small emerald ring used while something is loading.
export default function LoadingSpinner({ size = 28, label = 'Loading' }) {
  return (
    <span className="spinner-wrap" role={label ? 'status' : undefined}>
      <span className="spinner" style={{ width: size, height: size }} />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
