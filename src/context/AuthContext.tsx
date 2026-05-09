import { createContext, useContext, useState, ReactNode } from 'react';
import { apiFetch } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function storedUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(storedUser);
  const loading = false;

  async function login(email: string, password: string) {
    const data = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string, phone?: string) {
    const data = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

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
