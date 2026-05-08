import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    // TODO: call backend /api/auth/register
    console.log('Register:', form);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Create your account</h1>
          <p className="signup-sub">Join YourOrchard and rent your first tree this season.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-row">
            <div className="signup-field">
              <label>First name</label>
              <input
                type="text"
                placeholder="Arjun"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
              />
            </div>
            <div className="signup-field">
              <label>Last name</label>
              <input
                type="text"
                placeholder="Sharma"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="signup-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="arjun@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
          </div>

          <div className="signup-field">
            <label>Phone number</label>
            <div className="phone-wrap">
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="signup-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
          </div>

          <div className="signup-field">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
            />
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button type="submit" className="signup-btn">Create Account</button>
        </form>

        <p className="signup-login">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Log in</span>
        </p>
      </div>
    </div>
  );
}
