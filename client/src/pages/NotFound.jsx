import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="glass glass--solid auth-card">
        <Logo size={48} />
        <h1>Page not found</h1>
        <p className="muted">That link does not lead anywhere on Link Up.</p>
        <Link to="/home" className="btn btn--primary">Go to home</Link>
      </div>
    </div>
  );
}
