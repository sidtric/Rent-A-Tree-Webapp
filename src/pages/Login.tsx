import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';
  const { user, sendOtp, verifyOtp, googleAuth } = useAuth();

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate]);

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(email.trim());
      setStep('otp');
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendOtp(email.trim());
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email.trim(), code);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError('');
    setLoading(true);
    try {
      await googleAuth(credential);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(i: number, val: string) {
    const char = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = char;
    setOtp(next);
    if (char && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    digits.split('').forEach((d, idx) => { next[idx] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  if (step === 'otp') {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Check your email</h1>
            <p className="login-sub">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>

          <form className="login-form" onSubmit={handleVerify}>
            <div className="otp-boxes">
              {otp.map((val, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  className="otp-box"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Verifying…' : 'Log In'}
            </button>
          </form>

          <div className="login-resend">
            {countdown > 0 ? (
              <span className="login-resend-wait">Resend in {countdown}s</span>
            ) : (
              <button className="login-resend-btn" onClick={handleResend} disabled={loading}>
                Resend code
              </button>
            )}
          </div>

          <button className="login-back" onClick={() => { setStep('email'); setError(''); setOtp(['','','','','','']); }}>
            ← Change email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Log in to manage your tree and track your harvest.</p>
        </div>

        <form className="login-form" onSubmit={handleSendOtp}>
          <div className="login-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Sending code…' : 'Continue'}
          </button>
        </form>

        <div className="login-divider"><span>or</span></div>

        <div className="login-google-wrap">
          <GoogleLogin
            onSuccess={res => { if (res.credential) handleGoogle(res.credential); }}
            onError={() => setError('Google sign-in failed. Please try again.')}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <p className="login-signup">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
