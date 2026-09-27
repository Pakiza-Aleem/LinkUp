import Icon from './Icon';
import './EmptyState.css';

// Friendly message shown when a list has nothing to display.
export default function EmptyState({ icon = 'compass', title, message, children }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}
