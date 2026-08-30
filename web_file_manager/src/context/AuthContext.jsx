import { useCallback, useMemo, useState } from 'react';
import api from '../api/axios';
import AuthContext from './authContextValue';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null');
  } catch {
    // A corrupted entry must not take the whole app down on boot.
    localStorage.removeItem('authUser');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [roleId, setRoleId] = useState(() => readStoredUser()?.role ?? null);

  const login = useCallback((newToken, user) => {
    setToken(newToken);
    setRoleId(user.role);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRoleId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }, []);

  const checkToken = useCallback(async () => {
    try {
      const response = await api.post('/check_token');
      if (!response.data.valid) logout();
    } catch (error) {
      console.error('Error validating token:', error);
      logout();
    }
  }, [logout]);

  const value = useMemo(
    () => ({ token, isAuthenticated: !!token, role: roleId, login, logout, checkToken }),
    [token, roleId, login, logout, checkToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
