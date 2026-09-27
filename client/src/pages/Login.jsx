import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import AuthAside from '../components/AuthAside';
import './Auth.css';

export default function Login() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [localError, setLocalError] = useState('');

  // Start with a clean error every time this page opens.
  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.identifier.trim() || !form.password) {
      return setLocalError('Enter your email or username and your password.');
    }
    setLocalError('');
    dispatch(loginUser(form)); // on success the GuestRoute redirects to /home
  };

  return (
    <div className="auth-page">
      <AuthAside />
      <main className="auth-card glass glass--solid">
        <Logo size={44} showText className="auth-card__logo" />
        <h1>Welcome back</h1>
        <p className="muted">Log in to see what your circle is sharing.</p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <Input label="Email or username" id="identifier" name="identifier" autoComplete="username" value={form.identifier} onChange={handleChange} />
          <Input label="Password" id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} />
          {(localError || error) && <Alert>{localError || error}</Alert>}
          <Button type="submit" loading={status === 'loading'}>Log in</Button>
        </form>

        <p className="auth-card__switch muted">New to Link Up? <Link to="/register">Create an account</Link></p>
      </main>
    </div>
  );
}
