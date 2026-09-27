import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authActions';
import EditProfileForm from '../components/EditProfileForm';
import Button from '../components/Button';
import Icon from '../components/Icon';
import './Settings.css';

export default function Settings() {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);

  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>

      <section className="glass panel">
        <h2 className="panel__title">Edit profile</h2>
        <EditProfileForm />
      </section>

      <section className="glass panel">
        <h2 className="panel__title">Account</h2>
        <p className="muted">Signed in as <strong>{me.email}</strong></p>
        <Button variant="danger" onClick={() => dispatch(logoutUser())}>
          <Icon name="logout" size={18} /> Log out
        </Button>
      </section>
    </div>
  );
}
