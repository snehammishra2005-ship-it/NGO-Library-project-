import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../api/client.js';

// Staff auth. Token carries role ('ADMIN' | 'FRONT_DESK').
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setLoading(false); return; }
    api.me()
      .then((d) => setUser(d.user ? norm(d.user) : null))
      .catch(() => { tokenStore.clear(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (creds) => {
    const data = await api.login(creds);
    tokenStore.set(data.token);
    setUser(norm(data.user));
    return data.user;
  }, []);

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  const isAdmin = user?.role === 'ADMIN';
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

function norm(u) {
  return { ...u, id: u.id ?? u.sub, role: u.role };
}

export const useAuth = () => useContext(AuthContext);
