import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import Login from './components/Login';
import Home from './components/Home';
import UsersList from './components/UsersList';
import { useAuth } from './context/AuthContext';
import api from './api/axios'; 
import { useState, useEffect } from 'react';
import emptyProfile from './icons/profile.png'
import SearchBar from './components/custom/SearchBar';
import Menu from './components/custom/Menu';
import Profile from './components/Profile';


function App() {
  const navigate = useNavigate();
  const { logout, isAuthenticated, role, checkToken } = useAuth();

  const profileMenuStyles = {
    left: '100%',
    transform: 'translateX(-100%)',
    height:'fit-content',
    minHeight: 'auto',
    minWidth: '100px',
  };
  
  const [navExpanded, setNavExpanded] = useState(true);
  const [profileImg, setProfileImg] = useState(null);

  const handleLogout = async (evt) =>{
    evt.preventDefault();
    try {
      const response = await api.post('/logout');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error in logout:', error);
    }
  }

  const handleExpandContractMenu = ()=>{
    setNavExpanded(!navExpanded);
  }

  const getProfileImage = async () =>{
    try {
      if(JSON.parse(localStorage.getItem('authUser')).profile_img != null){

        const response = await api.get('/get_profile_image', { responseType: 'blob' });
        
        if(response.data){
          const url = URL.createObjectURL(response.data);
          setProfileImg(url);
        }
      }
    } catch (error) {
      console.error('Not authorized or error loading...', error);
    }
  }

  let on = 0;
  useEffect(() => {
    if(isAuthenticated){
      if(on == 0){
        getProfileImage();
        on = 1;
      }
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    //Check token every time the page changes
    if(location.pathname != '/login'){
      checkToken();
    }
  }, [location.pathname]);

  return (
    <div>
      {isAuthenticated && (
        <div>
          <nav id='vertical-nav' className={'vertical-nav '+ (navExpanded? '':'position-out')}>
            <h2 className='no-margin'>File manager</h2>
            <span>{navExpanded}</span>
            <div className='navigation-items'>
              <Link to='/'>Home</Link>
              <Link to='/pdfs'>Pdf</Link>
              <Link to='/documents'>Documnes</Link>
              <Link to='/documents'>Images</Link>
              <Link to='/videos'>Videos</Link>
              <Link to='/audios'>Audios</Link>
              <Link to='/storage'>Storage</Link>
              <Link to='/profile'>Profile</Link>
              {isAuthenticated && role == 1? 
                <div className='admin-menu'>
                  <Link to='/users' >Users</Link>
                </div> 
              : <></>}
            </div>
          </nav>
          {/* Nav bar */}
          <nav className={'horizontal-nav '+ (navExpanded? 'vertical-expanded ':'')}>
            <div className='horizontal-nav-box'>
              <button onClick={handleExpandContractMenu}>Show/hide</button>
            </div>
            <div className='search-box'>
              <SearchBar></SearchBar>
            </div>
            <Menu 
              trigger={
                <>
                  { profileImg != null ? 
                    <img src={profileImg} width='100' className='profile-nav' title='Profile'/>
                    :
                    <img src={emptyProfile} width='100' className='profile-nav' title='Profile'/>
                  }
                </>
              }
              customStyle={profileMenuStyles}
            >
              <div className='profile-menu-items'>
                <Link to='/profile' >Profile</Link>
                <Link to='/' onClick={handleLogout}>Logout</Link>
              </div>
            </Menu>
          </nav>
        </div>
      )}

      <main className={isAuthenticated ? ('main-container '+ (navExpanded? 'vertical-expanded ':'')) : '' }>
        <Routes>
          {/* Public routes */}
          <Route path='login' element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>  
            <Route path='/' element={<Home />} /> 
            <Route path='/users' element={<UsersList />} /> 
            <Route path='profile' element={<Profile />} />
          </Route>
          <Route path='*' element={<h1>404 - Not found page</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;