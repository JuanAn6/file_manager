import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import Icon from './custom/Icon';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      // A network failure has no `response`, so read it defensively instead of
      // throwing a second error on top of the first one.
      setError(err.response?.data?.message ?? 'Not valid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='login'>
      <section className='poster login-poster'>
        <p className='kicker' style={{ color: 'inherit', opacity: 0.8 }}>File manager</p>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Every file, on the grid.</h1>
      </section>

      <section className='login-panel'>
        <p className='kicker'>Sign in</p>
        <h2>Access your files</h2>

        <form onSubmit={handleSubmit} className='login-form'>
          <div className='field'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              className='input'
              type='email'
              name='email'
              autoComplete='email'
              placeholder='you@example.com'
              value={email}
              onChange={(evt) => setEmail(evt.target.value)}
              required
            />
          </div>

          <div className='field'>
            <label htmlFor='password'>Password</label>
            <div className='input-affix'>
              <input
                id='password'
                className='input'
                type={showPassword ? 'text' : 'password'}
                name='password'
                autoComplete='current-password'
                placeholder='••••••••'
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
                required
              />
              <button
                type='button'
                className='btn btn-secondary btn-icon'
                onClick={() => setShowPassword((shown) => !shown)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} />
              </button>
            </div>
          </div>

          {error && (
            <p className='field-error' role='alert'>
              {error}
            </p>
          )}

          <button type='submit' className='btn btn-primary btn-block' disabled={submitting}>
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Login;
