import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearUpdateError } from '../features/users/userSlice';
import { showToast } from '../features/ui/uiSlice';
import Button from './Button';
import Input from './Input';
import Alert from './Alert';
import AvatarUploader from './AvatarUploader';

// Form used in the Edit Profile modal and on the Settings page.
export default function EditProfileForm({ onSaved }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.auth.user);
  const { updateStatus, updateError } = useSelector((state) => state.users);

  const [form, setForm] = useState({ name: me.name, username: me.username, bio: me.bio || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const handleChange = (event) => {
    dispatch(clearUpdateError());
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const body = new FormData();
    body.append('name', form.name);
    body.append('username', form.username);
    body.append('bio', form.bio);
    if (avatarFile) body.append('profileImage', avatarFile);
    else if (removeImage) body.append('removeProfileImage', 'true');

    try {
      const updated = await dispatch(updateProfile(body)).unwrap();
      dispatch(showToast({ message: 'Profile updated' }));
      if (onSaved) onSaved(updated);
    } catch (error) {
      // shown below through updateError
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <AvatarUploader
        name="profileImage"
        previewUser={me}
        existingImage={removeImage ? '' : me.profileImage}
        onFileSelected={(file) => { setAvatarFile(file); setRemoveImage(false); }}
        onRemove={() => { setAvatarFile(null); setRemoveImage(true); }}
      />
      <Input label="Name" id="edit-name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Username" id="edit-username" name="username" value={form.username} onChange={handleChange} hint="Letters, numbers and underscores, 3-20 characters" required />
      <Input label="Bio" id="edit-bio" name="bio" multiline rows={3} maxLength={160} value={form.bio} onChange={handleChange} hint={`${form.bio.length}/160`} />
      {updateError && <Alert>{updateError}</Alert>}
      <Button type="submit" loading={updateStatus === 'loading'}>Save changes</Button>
    </form>
  );
}
