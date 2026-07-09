import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authService } from '../services/auth.service.js';
import { setUserToken } from '../services/api.js';

const UserAuthContext = createContext(null);
const TOKEN_KEY = 'bibliosuenos_user_token';
const GUEST_TOKEN_KEY = 'bibliosuenos_guest_token';
const ROLE_KEY = 'bibliosuenos_user_role';
const PROFILE_KEY = 'bibliosuenos_user_profile';

export function UserAuthProvider({ children }) {
  // Estado inicial desde localStorage
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || null);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [checkingSession, setCheckingSession] = useState(true);
  const attemptedAutoLogin = useRef(false);

  // Sincronizar token con el interceptor de API
  useEffect(() => {
    setUserToken(token);
  }, [token]);

  // Guardar perfil en localStorage cuando cambie
  useEffect(() => {
    if (profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  }, [profile]);

  // ========== LOGIN CON GOOGLE ==========
  const loginWithGoogle = useCallback(async (credential) => {
    const { token: newToken, profile: userProfile } = await authService.loginWithGoogle(credential);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(ROLE_KEY, 'user');
    setRole('user');
    setProfile(userProfile);
    setUserToken(newToken);
    setToken(newToken);
    return { profile: userProfile };
  }, []);

  // ========== LOGIN COMO INVITADO ==========
  const loginAsGuest = useCallback(async () => {
    const existingGuestToken = localStorage.getItem(GUEST_TOKEN_KEY);
    const { token: newToken, guestToken, profile: userProfile } = await authService.loginAsGuest(existingGuestToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
    localStorage.setItem(ROLE_KEY, 'user');
    setRole('user');
    setProfile(userProfile);
    setUserToken(newToken);
    setToken(newToken);
    return { profile: userProfile };
  }, []);

  // ========== REGISTRO CON EMAIL ==========
  const register = useCallback(async (name, email, password) => {
    const { token: newToken, profile: userProfile } = await authService.register(name, email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(ROLE_KEY, 'user');
    setRole('user');
    setProfile(userProfile);
    setUserToken(newToken);
    setToken(newToken);
    return { profile: userProfile };
  }, []);

  // ========== LOGIN CON EMAIL (usuario normal) ==========
  const loginWithEmail = useCallback(async (email, password) => {
    const { token: newToken, profile: userProfile } = await authService.loginWithEmail(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(ROLE_KEY, 'user');
    setRole('user');
    setProfile(userProfile);
    setUserToken(newToken);
    setToken(newToken);
    return { profile: userProfile };
  }, []);

  // ========== LOGIN UNIFICADO (admin + usuario normal) ==========
  const loginUnified = useCallback(async (email, password) => {
    const { token: newToken, role: userRole, profile: userProfile } = await authService.loginUnified(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(ROLE_KEY, userRole);
    setRole(userRole);
    if (userProfile) {
      setProfile(userProfile);
    } else {
      // Si es admin, no tiene perfil en la tabla Profile
      setProfile(null);
    }
    setUserToken(newToken);
    setToken(newToken);
    return { role: userRole, profile: userProfile };
  }, []);

  // ========== CIERRE DE SESIÓN ==========
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GUEST_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setRole(null);
    setProfile(null);
    setUserToken(null);
    setToken(null);
  }, []);

  // ========== AUTO-LOGIN COMO INVITADO ==========
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
      .catch(() => {
        localStorage.removeItem(GUEST_TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(PROFILE_KEY);
        setRole(null);
        setProfile(null);
      })
      .finally(() => setCheckingSession(false));
  }, [token, loginAsGuest]);

  // ========== CONTEXT VALUE ==========
  const value = {
    isAuthenticated: Boolean(token),
    checkingSession,
    role,
    profile,
    loginWithGoogle,
    loginAsGuest,
    register,
    loginWithEmail,
    loginUnified,
    logout,
    // Método para actualizar el perfil desde otros componentes (ej. ProfileContext)
    updateProfile: useCallback((newProfile) => {
      setProfile(newProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    }, []),
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