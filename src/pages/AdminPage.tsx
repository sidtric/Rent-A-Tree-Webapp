import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = !!user && (user.role === 'admin' || ADMIN_EMAILS.includes(user.email.toLowerCase()));

  useEffect(() => {
    if (!loading && !user) navigate('/login', { state: { from: '/admin' } });
    if (!loading && user && !isAdmin) navigate('/');
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) return null;

  return (
    <AdminDashboard
      user={user}
      onExit={() => navigate('/')}
    />
  );
}
