import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../features/auth/authSlice';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import AuthAside from '../components/AuthAside';
import AvatarUploader from '../components/AvatarUploader';
import './Auth.css';

export default function Register() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  // Front-end validation for quick feedback. The server validates everything again.
  const validate = () => {
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter your name (at least 2 characters).';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username.trim())) found.username = 'Use 3-20 letters, numbers or underscores.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = 'Enter a valid email address.';
    if (form.password.length < 6) found.password = 'Password must be at least 6 characters.';
    return found;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // multipart/form-data so the optional avatar file travels with the text fields
    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('username', form.username.trim());
    body.append('email', form.email.trim());
    body.append('password', form.password);
    if (avatarFile) body.append('profileImage', avatarFile);

    dispatch(registerUser(body));
  };

  return (
    <div className="auth-page">
      <AuthAside />
      <main className="auth-card glass glass--solid">
        <Logo size={44} showText className="auth-card__logo" />
        <h1>Create your account</h1>
        <p className="muted">It takes less than a minute.</p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <AvatarUploader
            name="profileImage"
            previewUser={{ name: form.name || 'You', username: form.username }}
            onFileSelected={setAvatarFile}
            onRemove={() => setAvatarFile(null)}
          />
          <Input label="Name" id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} />
          <Input label="Username" id="username" name="username" autoComplete="username" value={form.username} onChange={handleChange} error={errors.username} />
          <Input label="Email" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
          <Input label="Password" id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} hint="At least 6 characters" />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" loading={status === 'loading'}>Create account</Button>
        </form>

        <p className="auth-card__switch muted">Already have an account? <Link to="/login">Log in</Link></p>
      </main>
    </div>
  );
}
