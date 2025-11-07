import React, { createContext, useContext, useState } from 'react';

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
  
  // 'isAuthenticated' is crucial for ProtectedRoute
  const isAuthenticated = !!token; 

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);