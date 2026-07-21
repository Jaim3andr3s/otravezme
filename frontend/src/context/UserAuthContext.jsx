import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authService } from '../services/auth.service.js';
import { setUserToken } from '../services/api.js';
import { STORAGE_KEYS } from '../constants/storage.js';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN));
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEYS.ROLE) || null);
  const [checkingSession, setCheckingSession] = useState(true);
  const attemptedAutoLogin = useRef(false);

  useEffect(() => {
    setUserToken(token);
  }, [token]);

  function saveAuth(newToken, newRole) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
    setRole(newRole);
    setUserToken(newToken);
    setToken(newToken);
  }

  const loginWithGoogle = useCallback(async (credential) => {
    const { token: newToken } = await authService.loginWithGoogle(credential);
    saveAuth(newToken, 'user');
  }, []);

  const loginAsGuest = useCallback(async () => {
    const existingGuestToken = localStorage.getItem(STORAGE_KEYS.GUEST_TOKEN);
    const { token: newToken, guestToken } = await authService.loginAsGuest(existingGuestToken);
    localStorage.setItem(STORAGE_KEYS.GUEST_TOKEN, guestToken);
    saveAuth(newToken, 'user');
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token: newToken } = await authService.register(name, email, password);
    saveAuth(newToken, 'user');
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    const { token: newToken } = await authService.loginWithEmail(email, password);
    saveAuth(newToken, 'user');
  }, []);

  const loginUnified = useCallback(async (email, password) => {
    const { token: newToken, role: userRole } = await authService.loginUnified(email, password);
    saveAuth(newToken, userRole);
    return { role: userRole };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.GUEST_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    setRole(null);
    setUserToken(null);
    setToken(null);
  }, []);

  useEffect(() => {
    if (token || attemptedAutoLogin.current) {
      setCheckingSession(false);
      return;
    }
    attemptedAutoLogin.current = true;
    const guestToken = localStorage.getItem(STORAGE_KEYS.GUEST_TOKEN);
    if (!guestToken) {
      setCheckingSession(false);
      return;
    }
    loginAsGuest()
      .catch(() => {
        localStorage.removeItem(STORAGE_KEYS.GUEST_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ROLE);
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
        setRole(null);
      })
      .finally(() => setCheckingSession(false));
  }, [token, loginAsGuest]);

  const value = {
    isAuthenticated: Boolean(token),
    checkingSession,
    role,
    loginWithGoogle,
    loginAsGuest,
    register,
    loginWithEmail,
    loginUnified,
    logout,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth debe usarse dentro de UserAuthProvider');
  return ctx;
}
