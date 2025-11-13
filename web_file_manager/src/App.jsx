import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import Login from './components/Login';
import Home from './components/Home';
import { useAuth } from './context/AuthContext';
import api from './api/axios'; 
import {  } from 'react-router-dom';


function App() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

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

  return (
    <div>
      {isAuthenticated && (
        <div>
          <nav className='vertical-nav'>
            <h2 className='no-margin'>File manager</h2>
          </nav>
          {/* Nav bar */}
          <nav className='horizontal-nav vertical-expanded'>
            <Link to="/">Home</Link>
            <Link to="/" onClick={handleLogout}>Logout</Link>
          </nav>
        </div>
      )}
      <main className='main-container vertical-expanded'>
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