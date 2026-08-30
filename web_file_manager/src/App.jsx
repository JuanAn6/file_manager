import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoutes';
import Login from './components/Login';
import Home from './components/Home';
import UsersList from './components/UsersList';
import Profile from './components/Profile';
import FilesByCategory from './components/FilesByCategory';
import Storage from './components/Storage';
import NotFound from './components/NotFound';
import SearchBar from './components/custom/SearchBar';
import Menu from './components/custom/Menu';
import Icon from './components/custom/Icon';
import GlobalDropUpload from './components/custom/GlobalDropUpload';
import { useAuth } from './context/useAuth';
import api from './api/axios';
import emptyProfile from './icons/profile.png';

const SECTIONS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/pdfs', label: 'Pdf', icon: 'file-text' },
  { to: '/documents', label: 'Documents', icon: 'file' },
  { to: '/images', label: 'Images', icon: 'image' },
  { to: '/videos', label: 'Videos', icon: 'video' },
  { to: '/audios', label: 'Audios', icon: 'music' },
  { to: '/storage', label: 'Storage', icon: 'hard-drive' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, role, checkToken } = useAuth();

  const [navExpanded, setNavExpanded] = useState(true);
  const [profileImg, setProfileImg] = useState(null);

  const handleLogout = async (evt) => {
    evt.preventDefault();
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error in logout:', error);
    } finally {
      // The local session is dropped either way: a failed call must not strand
      // the user in a signed-in shell with a token the server already rejected.
      logout();
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileImg(null);
      return;
    }

    let objectUrl = null;
    let cancelled = false;

    const getProfileImage = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
        if (!storedUser?.profile_img) return;

        const response = await api.get('/get_profile_image', { responseType: 'blob' });
        if (cancelled || !response.data) return;

        objectUrl = URL.createObjectURL(response.data);
        setProfileImg(objectUrl);
      } catch (error) {
        console.error('Not authorized or error loading the profile image:', error);
      }
    };

    getProfileImage();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Check the token every time the route changes, except on the login page.
    if (location.pathname !== '/login') checkToken();
  }, [location.pathname, checkToken]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className={'shell ' + (navExpanded ? '' : 'shell-collapsed')}>
      {/* Files dragged onto any part of the app upload into the open folder. */}
      <GlobalDropUpload />

      <div className='shell-brand'>
        <h1 className='nav-brand'>File manager</h1>
      </div>

      <nav className='nav shell-topbar' aria-label='Main'>
        <button
          type='button'
          className='btn btn-ghost btn-icon'
          onClick={() => setNavExpanded((expanded) => !expanded)}
          aria-expanded={navExpanded}
          aria-label={navExpanded ? 'Hide navigation' : 'Show navigation'}
          title={navExpanded ? 'Hide navigation' : 'Show navigation'}
        >
          <Icon name='panel-left' />
        </button>

        <div className='topbar-search'>
          <SearchBar />
        </div>

        <Menu
          align='end'
          trigger={
            <img src={profileImg ?? emptyProfile} className='avatar' title='Profile' alt='' />
          }
        >
          <NavLink className='menu-item' to='/profile'>
            <Icon name='user' size={16} /> Profile
          </NavLink>
          <button type='button' className='menu-item' onClick={handleLogout}>
            <Icon name='log-out' size={16} /> Logout
          </button>
        </Menu>
      </nav>

      <aside className='shell-side'>
        <div className='side-nav'>
          {SECTIONS.map((section) => (
            <NavLink key={section.to} to={section.to} end={section.end} className='nav-link'>
              <Icon name={section.icon} size={16} />
              {section.label}
            </NavLink>
          ))}

          {role === 1 && (
            <div className='side-group'>
              <p className='kicker' style={{ padding: '0 var(--space-sm)' }}>Admin</p>
              <NavLink to='/users' className='nav-link'>
                <Icon name='users' size={16} /> Users
              </NavLink>
            </div>
          )}
        </div>
      </aside>

      <main className='shell-main'>
        <Routes>
          {/* Already signed in: the login form has no business inside the shell. */}
          <Route path='/login' element={<Navigate to='/' replace />} />

          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Home />} />
            <Route path='/users' element={<UsersList />} />
            <Route path='/profile' element={<Profile />} />

            {/* One component per section; the category drives the query. */}
            <Route path='/pdfs' element={<FilesByCategory category='pdfs' title='Pdf' icon='file-text' />} />
            <Route path='/documents' element={<FilesByCategory category='documents' title='Documents' icon='file' />} />
            <Route path='/images' element={<FilesByCategory category='images' title='Images' icon='image' />} />
            <Route path='/videos' element={<FilesByCategory category='videos' title='Videos' icon='video' />} />
            <Route path='/audios' element={<FilesByCategory category='audios' title='Audios' icon='music' />} />
            <Route path='/storage' element={<Storage />} />
          </Route>

          <Route path='*' element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
