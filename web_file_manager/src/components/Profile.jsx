import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import Loading from './custom/Loading';
import Icon from './custom/Icon';
import emptyProfile from '../icons/profile.png';

function Profile() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const load = async () => {
      setLoadingComplete(false);
      try {
        const response = await api.get('/profile');
        if (cancelled) return;
        setUser({ ...response.data.user, last_name: response.data.user.last_name ?? '' });
      } catch (err) {
        console.error('Error getting profile:', err);
        if (!cancelled) setError('The profile could not be loaded.');
      } finally {
        if (!cancelled) setLoadingComplete(true);
      }

      try {
        const image = await api.get('/get_profile_image', { responseType: 'blob' });
        if (cancelled || !image.data) return;
        objectUrl = URL.createObjectURL(image.data);
        setProfileImg(objectUrl);
      } catch (err) {
        console.error('Not authorized or error loading the profile image:', err);
      }
    };

    load();

    return () => {
      cancelled = true;
      // Blob URLs live until they are revoked; the old code leaked one per visit.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleChangeInput = (evt) => {
    setUser((current) => ({ ...current, [evt.target.name]: evt.target.value }));
  };

  const handleImageChange = async (evt) => {
    const file = evt.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfileImg(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profile_img', file);

    try {
      await api.post('/update_profile_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error('Error updating the profile image:', err);
      setError('The image could not be uploaded.');
    }
  };

  const handleClear = async () => {
    setProfileImg(null);
    if (imageInputRef.current) imageInputRef.current.value = '';

    // FormData stringifies, and the API reads the literal 'null' as "clear it".
    const formData = new FormData();
    formData.append('profile_img', 'null');

    try {
      await api.post('/update_profile_image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error('Error clearing the profile image:', err);
      setError('The image could not be cleared.');
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const response = await api.post('/update_profile', { ...user });
      setUser({ ...response.data.user, last_name: response.data.user.last_name ?? '' });
      setSaved(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('The profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='card'>
      <p className='kicker'>Account</p>
      <h2>Profile</h2>

      {!loadingComplete ? (
        <Loading />
      ) : !user ? (
        <p className='field-error' role='alert'>{error}</p>
      ) : (
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            updateProfile();
          }}
        >
          <hr className='hr' />

          <div className='grid' style={{ '--cols': 12 }}>
            <div style={{ gridColumn: 'span 4' }}>
              <div className='grayscale' style={{ aspectRatio: '1 / 1' }}>
                <img src={profileImg ?? emptyProfile} alt='' />
              </div>

              <div className='stack' style={{ marginTop: 'var(--space-sm)' }}>
                <label className='btn btn-secondary' htmlFor='profile_img'>
                  <Icon name='image' size={16} /> Change image
                </label>
                <input
                  id='profile_img'
                  type='file'
                  name='profile_img'
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept='image/*'
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
                />
                <button type='button' className='btn btn-ghost' onClick={handleClear}>
                  <Icon name='trash' size={16} /> Clear image
                </button>
              </div>
            </div>

            <div className='stack' style={{ gridColumn: 'span 8' }}>
              <div className='field'>
                <span className='label'>Email</span>
                <p style={{ margin: 0 }}>{user.email}</p>
              </div>

              <div className='field'>
                <label htmlFor='name'>Name</label>
                <input id='name' className='input' name='name' value={user.name ?? ''} onChange={handleChangeInput} />
              </div>

              <div className='field'>
                <label htmlFor='last_name'>Last name</label>
                <input
                  id='last_name'
                  className='input'
                  name='last_name'
                  value={user.last_name}
                  onChange={handleChangeInput}
                />
              </div>

              {error && <p className='field-error' role='alert'>{error}</p>}
              {saved && !error && <p className='kicker' role='status'>Profile saved</p>}

              <div>
                <button type='submit' className='btn btn-primary' disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;
