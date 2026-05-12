import { useEffect, useState } from 'react';
import { useAuth, type AuthUser } from './context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import './admin/admin.css';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

const isAdmin = (u: AuthUser | null) =>
  !!u && (u.role === 'admin' || ADMIN_EMAILS.includes(u.email.toLowerCase()));

function AdminLogin() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password required.'); return; }
    setBusy(true);
    try { await login(form.email, form.password); }
    catch (err: any) { setError(err.message || 'Login failed.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="alogin-shell">
      <div className="alogin-card">
        <div className="alogin-logo">🌳</div>
        <h1 className="alogin-title">YourOrchard Admin</h1>
        <p className="alogin-sub">Restricted area — staff access only.</p>

        <form onSubmit={submit} className="alogin-form">
          <label className="alogin-label">Email</label>
          <input
            type="email"
            className="alogin-input"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            autoFocus
            autoComplete="username"
          />

          <label className="alogin-label">Password</label>
          <input
            type="password"
            className="alogin-input"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
          />

          {error && <div className="alogin-err">{error}</div>}

          <button type="submit" className="alogin-btn" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AccessDenied({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  return (
    <div className="alogin-shell">
      <div className="alogin-card">
        <div className="alogin-logo alogin-logo--err">⛔</div>
        <h1 className="alogin-title">Access Denied</h1>
        <p className="alogin-sub">
          The account <strong>{user.email}</strong> is not authorized to use this dashboard.
          Contact a system administrator if you believe this is an error.
        </p>
        <button className="alogin-btn alogin-btn--secondary" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="alogin-shell">
      <div className="alogin-card">
        <p className="alogin-sub">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading, logout } = useAuth();

  useEffect(() => { fetch(`${API_BASE}/health`).catch(() => {}); }, []);

  if (loading)            return <Loading />;
  if (!user)              return <AdminLogin />;
  if (!isAdmin(user))     return <AccessDenied user={user} onLogout={logout} />;
  return <AdminDashboard user={user} onExit={logout} />;
}
