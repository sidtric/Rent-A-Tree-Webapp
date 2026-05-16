import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../lib/api';

export interface DeliveryAddress {
  flat: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  deliveryAddress?: DeliveryAddress;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function storedUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(storedUser);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    apiFetch<AuthUser>('/api/auth/me')
      .then(u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); })
      .catch(() => {
        // Don't wipe the session on transient backend errors (500/503/network).
        // Real 401s come through apiFetch's auth:expired event, which already handles logout.
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleExpired() { setUser(null); }
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

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
    localStorage.removeItem('yo_cart');
    sessionStorage.removeItem('yo_cart_open');
    setUser(null);
  }

  function updateUser(patch: Partial<AuthUser>) {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
