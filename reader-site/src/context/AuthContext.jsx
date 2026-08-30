import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../api/client.js';

// Reader-only auth. This app has no concept of staff accounts.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setLoading(false); return; }
    api.me()
      .then((d) => setUser(d.user ? normalize(d.user) : null))
      .catch(() => { tokenStore.clear(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const finish = useCallback((data) => {
    tokenStore.set(data.token);
    setUser(normalize(data.user));
    return data.user;
  }, []);

  const login = async (creds) => finish(await api.readerLogin(creds));
  const signup = async (info) => finish(await api.readerSignup(info));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function normalize(u) {
  return { ...u, id: u.id ?? u.sub };
}

export const useAuth = () => useContext(AuthContext);
