import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth.service.js';
import { setAuthToken } from '../services/api.js';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'bibliosuenos_admin_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = useCallback(async (username, password) => {
    const { token: newToken } = await authService.login(username, password);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin: Boolean(token), login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
