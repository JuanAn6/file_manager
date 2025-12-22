import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initially, it looks for the token in localStorage
  const initialToken = localStorage.getItem('authToken');
  const [token, setToken] = useState(initialToken);

  const login = (newToken) => {
    // 1. Save the token in the state and localStorage
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    // 2. Clear the state and localStorage
    setToken(null);
    localStorage.removeItem('authToken');
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

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);