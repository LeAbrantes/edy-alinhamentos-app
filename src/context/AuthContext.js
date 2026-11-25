import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  loadSession,
  loginUser,
  registerUser,
  saveSession,
} from '../services/authService';

export const AuthContext = createContext({
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao abrir o app, recupera a sessão salva
  useEffect(() => {
    let active = true;
    loadSession().then((saved) => {
      if (!active) return;
      setUser(saved);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const logged = await loginUser(credentials);
    await saveSession(logged);
    setUser(logged);
  }, []);

  const signUp = useCallback(async (data) => {
    const created = await registerUser(data);
    await saveSession(created);
    setUser(created);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
