import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authService } from '../services/auth.service.js';
import { setUserToken } from '../services/api.js';

const UserAuthContext = createContext(null);
const TOKEN_KEY = 'bibliosuenos_user_token';
const GUEST_TOKEN_KEY = 'bibliosuenos_guest_token';

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [checkingSession, setCheckingSession] = useState(true);
  const attemptedAutoLogin = useRef(false);

  useEffect(() => {
    setUserToken(token);
  }, [token]);

  const loginWithGoogle = useCallback(async (credential) => {
    const { token: newToken } = await authService.loginWithGoogle(credential);
    localStorage.setItem(TOKEN_KEY, newToken);
    setUserToken(newToken);
    setToken(newToken);
  }, []);

  const loginAsGuest = useCallback(async () => {
    const existingGuestToken = localStorage.getItem(GUEST_TOKEN_KEY);
    const { token: newToken, guestToken } = await authService.loginAsGuest(existingGuestToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
    setUserToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUserToken(null);
    setToken(null);
  }, []);

  useEffect(() => {
    if (token || attemptedAutoLogin.current) {
      setCheckingSession(false);
      return;
    }
    attemptedAutoLogin.current = true;
    const guestToken = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!guestToken) {
      setCheckingSession(false);
      return;
    }
    loginAsGuest()
      .catch(() => localStorage.removeItem(GUEST_TOKEN_KEY))
      .finally(() => setCheckingSession(false));
  }, [token, loginAsGuest]);

  return (
    <UserAuthContext.Provider
      value={{ isAuthenticated: Boolean(token), checkingSession, loginWithGoogle, loginAsGuest, logout }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth debe usarse dentro de UserAuthProvider');
  return ctx;
}
