import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)', padding: '40px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: '72px', fontWeight: 800, color: '#e5e7eb', margin: '0 0 8px', lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', margin: '0 0 12px' }}>Page not found</h1>
      <p style={{ fontSize: '15px', color: '#666', margin: '0 0 32px', maxWidth: '360px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{ padding: '12px 28px', background: '#2d5a27', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
      >
        Back to Home
      </button>
    </div>
  );
}
