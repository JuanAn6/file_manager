import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initially, it looks for the token in localStorage
  const initialToken = localStorage.getItem('authToken');
  const [token, setToken] = useState(initialToken);
  const initialRole = JSON.parse(localStorage.getItem('authUser'))?.role;
  const [roleId, setRoleId] = useState(initialRole);

  const login = (newToken, user) => {
    // 1. Save the token in the state and localStorage
    setToken(newToken);
    setRoleId(user.role)
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(user));
  };

  const logout = () => {
    // 2. Clear the state and localStorage
    setToken(null);
    localStorage.removeItem('authToken');
    setRoleId(null);
    localStorage.removeItem('authUser');
  };

  const checkToken = async () => {
    try {
      const response = await api.post('/check_token');
      if(!response.data.valid){ 
        logout();
      }
    } catch (error) {
      logout();
      console.error("Error validating token:", error);
    }
  }
  
  // 'isAuthenticated' is crucial for ProtectedRoute
  const isAuthenticated = !!token; 
  const role = roleId; 

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, role, login, logout, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);