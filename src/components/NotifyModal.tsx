import { useState } from 'react';
import { apiFetch } from '../lib/api';
import '../pages/Shop.css';

const validators = {
  name:  (v: string) => !v.trim() ? 'Your name is required.' : !/^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(v.trim()) ? 'Letters only (min 2 characters).' : '',
  email: (v: string) => !v.trim() ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address.' : '',
  phone: (v: string) => v.trim() && !/^[6-9]\d{9}$/.test(v) ? 'Must start with 6–9 and be 10 digits.' : '',
};

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  successMsg: string;
  backendMessage: string;
  onClose: () => void;
}

export default function NotifyModal({ icon, title, subtitle, successMsg, backendMessage, onClose }: Props) {
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [phone,      setPhone]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [err,        setErr]        = useState('');
  const [touched,    setTouched]    = useState<Record<string, boolean>>({});

  function touch(field: string) { setTouched(prev => ({ ...prev, [field]: true })); }

  function inputClass(field: keyof typeof validators, value: string) {
    if (!touched[field]) return '';
    return validators[field](value) ? 'notify-input-error' : 'notify-input-valid';
  }

  function fieldErr(field: keyof typeof validators, value: string) {
    if (!touched[field]) return '';
    return validators[field](value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setTouched({ name: true, email: true, phone: true });
    const nameErr  = validators.name(name);
    const emailErr = validators.email(email);
    const phoneErr = validators.phone(phone);
    if (nameErr)  { setErr(nameErr);  return; }
    if (emailErr) { setErr(emailErr); return; }
    if (phoneErr) { setErr(phoneErr); return; }

    setSubmitting(true);
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: backendMessage,
          type: 'notify',
        }),
      });
      setDone(true);
    } catch (e: any) {
      setErr(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="notify-overlay" onClick={onClose}>
      <div className="notify-modal" onClick={e => e.stopPropagation()}>
        <button className="notify-close" onClick={onClose}>✕</button>

        {done ? (
          <div className="notify-success">
            <div className="notify-success-icon">✓</div>
            <h3>You're on the list!</h3>
            <p>{successMsg}</p>
            <button className="notify-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="notify-litchi-icon">{icon}</div>
            <h3 className="notify-title">{title}</h3>
            <p className="notify-sub">{subtitle}</p>
            <form onSubmit={handleSubmit} className="notify-form">

              <div className="notify-field">
                <label>Your name</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  className={inputClass('name', name)}
                  onChange={e => setName(e.target.value.replace(/[^A-Za-z\s.'-]/g, ''))}
                  onBlur={() => touch('name')}
                />
                {fieldErr('name', name) && <span className="notify-field-err">{fieldErr('name', name)}</span>}
              </div>

              <div className="notify-field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  className={inputClass('email', email)}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                />
                {fieldErr('email', email) && <span className="notify-field-err">{fieldErr('email', email)}</span>}
              </div>

              <div className="notify-field">
                <label>Phone <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                <div className={`notify-phone-wrap ${touched.phone ? (validators.phone(phone) ? 'phone-error' : (phone ? 'phone-valid' : '')) : ''}`}>
                  <span>+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => touch('phone')}
                  />
                </div>
                {fieldErr('phone', phone) && <span className="notify-field-err">{fieldErr('phone', phone)}</span>}
              </div>

              {err && <p className="notify-err">{err}</p>}
              <button type="submit" className="notify-submit" disabled={submitting}>
                {submitting ? 'Saving…' : <>Notify Me <span className="btn-arrow">→</span></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
