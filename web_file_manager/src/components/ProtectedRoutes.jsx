import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

function ProtectedRoute() {
  const { isAuthenticated } = useAuth(); 

  if (!isAuthenticated) {
    // If NOT authenticated, redirect to login
    return <Navigate to="/login" replace />; 
  }

  // If the user is authenticated, render the 'Outlet' component.
  // This is where the child components you define in App.js (Home, About, etc.) will be displayed.
  return <Outlet />; 
}

export default ProtectedRoute;