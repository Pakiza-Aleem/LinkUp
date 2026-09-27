import Icon from './Icon';
import './Alert.css';

// Inline message box. type: "error" | "success"
export default function Alert({ type = 'error', children }) {
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon name={type === 'error' ? 'alert' : 'check'} size={18} />
      <span>{children}</span>
    </div>
  );
}
