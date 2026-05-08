import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    // TODO: call backend /api/auth/login
    console.log('Login:', form);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Log in to manage your tree and track your harvest.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="arjun@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">Log In</button>
        </form>

        <p className="login-signup">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
