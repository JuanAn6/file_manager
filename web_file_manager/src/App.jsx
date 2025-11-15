import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import Login from './components/Login';
import Home from './components/Home';
import { useAuth } from './context/AuthContext';
import api from './api/axios'; 
import { useState } from 'react';


function App() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  
  const [navExpanded, setNavExpanded] = useState(true);

  const handleLogout = async (evt) =>{
    evt.preventDefault();
    try {
      const response = await api.post('/logout');
      logout();
      navigate('/login');
    } catch (error) {
      console.error("Error in logout:", error);
    }
  }

  const handleExpandContractMenu = ()=>{
    setNavExpanded(!navExpanded);
    console.log(navExpanded);
  }

  return (
    <div>
      {isAuthenticated && (
        <div>
          <nav id="vertical-nav" className={'vertical-nav '+ (navExpanded? '':'position-out')}>
            <h2 className='no-margin'>File manager</h2>
            <span>{navExpanded}</span>
          </nav>
          {/* Nav bar */}
          <nav className={'horizontal-nav '+ (navExpanded? 'vertical-expanded ':'')}>
            <button onClick={handleExpandContractMenu}>Show/hide</button>
            <Link to="/">Home</Link>
            <Link to="/" onClick={handleLogout}>Logout</Link>
          </nav>
        </div>
      )}

      <main className={isAuthenticated ? ('main-container '+ (navExpanded? 'vertical-expanded ':'')) : '' }>
        <Routes>
          {/* Public routes */}
          <Route path="login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>  
            <Route path="/" element={<Home />} /> 

            {/* <Route path="profile" element={<Profile />} /> */}
            
          </Route>
          <Route path="*" element={<h1>404 - Not found page</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;