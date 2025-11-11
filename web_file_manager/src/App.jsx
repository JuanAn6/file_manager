import { Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import Login from './components/Login';
import Home from './components/Home';
import { useAuth } from './context/AuthContext';
import api from './api/axios'; 

function App() {
  const { logout } = useAuth();
  const handleLogout = async (evt) =>{
    evt.preventDefault();
    try {
      const response = await api.post('/logout');
      logout();
      navigate('/');
    } catch (error) {
      console.error("Error in logout:", error);
    }
  }


  return (
    <div>
      {/* Nav bar */}
      <nav>
        <Link to="/">Home</Link>
        <Link to="/" onClick={handleLogout}>Logout</Link>
      </nav>
      <hr />
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
    </div>
  );
}

export default App;