import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './SignUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const { user, sendOtp, verifyOtp, googleAuth } = useAuth();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return; }

    setLoading(true);
    try {
      await sendOtp(email.trim(), name.trim(), phone);
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
      await sendOtp(email.trim(), name.trim(), phone);
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
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
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
      <div className="signup-page">
        <div className="signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Check your email</h1>
            <p className="signup-sub">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>

          <form className="signup-form" onSubmit={handleVerify}>
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

            {error && <p className="signup-error">{error}</p>}

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? 'Verifying…' : 'Create Account'}
            </button>
          </form>

          <div className="signup-resend">
            {countdown > 0 ? (
              <span className="signup-resend-wait">Resend in {countdown}s</span>
            ) : (
              <button className="signup-resend-btn" onClick={handleResend} disabled={loading}>
                Resend code
              </button>
            )}
          </div>

          <button className="signup-back" onClick={() => { setStep('details'); setError(''); setOtp(['','','','','','']); }}>
            ← Change email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Create your account</h1>
          <p className="signup-sub">Join YourOrchard and rent your first tree this season.</p>
        </div>

        <form className="signup-form" onSubmit={handleSendOtp}>
          <div className="signup-field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Rahul Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="signup-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Sending code…' : 'Continue'}
          </button>
        </form>

        <div className="signup-divider"><span>or</span></div>

        <div className="signup-google-wrap">
          <GoogleLogin
            onSuccess={async res => {
              if (!res.credential) return;
              setError('');
              setLoading(true);
              try {
                await googleAuth(res.credential);
                navigate('/');
              } catch (err: any) {
                setError(err.message || 'Google sign-in failed.');
              } finally {
                setLoading(false);
              }
            }}
            onError={() => setError('Google sign-in failed. Please try again.')}
            theme="outline"
            size="large"
            width="100%"
            text="signup_with"
            shape="rectangular"
          />
        </div>

        <p className="signup-login">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Log in</span>
        </p>
      </div>
    </div>
  );
}
