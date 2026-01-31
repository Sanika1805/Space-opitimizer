import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((data) => {
        if (data._id) setUser(data);
        else localStorage.removeItem('token');
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (email, password) => {
    return authApi.login({ email, password }).then((data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
        return data;
      }
      throw new Error(data.message || 'Login failed');
    });
  };

  const register = (name, email, password, role) => {
    return authApi.register({ name, email, password, role }).then((data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
        return data;
      }
      throw new Error(data.message || 'Register failed');
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
