import { useState } from 'react';
import { apiFetch } from '../lib/api';
import './Contact.css';

const INFO = [
  {
    title: 'Email Us',
    detail: 'support.YourOrchard@gmail.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:support.YourOrchard@gmail.com',
  },
  {
    title: 'Call Us',
    detail: '+91 75358 50398',
    sub: 'Mon – Sat, 9am – 6pm',
    href: 'tel:+917535850398',
  },
  {
    title: 'Visit the Farm',
    detail: 'Ramnagar, Uttarakhand',
    sub: 'India — 244715',
    href: null,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="contact">

      <section className="contact-hero">
        <div className="contact-hero-inner">
          <span className="contact-label">Get in Touch</span>
          <h1 className="contact-title">We would love to hear from you</h1>
          <p className="contact-sub">Whether you have a question about renting a tree, your harvest, or anything else — our team is here.</p>
        </div>
      </section>

      <section className="contact-body">
        <div className="contact-body-inner">

          <div className="contact-info">
            {INFO.map(item => (
              <div key={item.title} className="contact-info-card">
                <div className="contact-info-title">{item.title}</div>
                {item.href ? (
                  <a href={item.href} className="contact-info-detail">{item.detail}</a>
                ) : (
                  <div className="contact-info-detail">{item.detail}</div>
                )}
                <div className="contact-info-sub">{item.sub}</div>
              </div>
            ))}

            <div className="contact-faq">
              <h3>Common Questions</h3>
              <div className="contact-faq-list">
                <div className="contact-faq-item">
                  <div className="contact-faq-q">When does the harvest season start?</div>
                  <div className="contact-faq-a">Harvest begins around May 15 for Chausa, and extends through July for Dasheri and Langra.</div>
                </div>
                <div className="contact-faq-item">
                  <div className="contact-faq-q">Can I visit my tree?</div>
                  <div className="contact-faq-a">We do arrange farm visits during the season. Write to us and we will work something out.</div>
                </div>
                <div className="contact-faq-item">
                  <div className="contact-faq-q">How are weekly updates sent?</div>
                  <div className="contact-faq-a">Photos and videos of your specific tree are posted to your dashboard every week during the season.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-wrap">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success-icon">✓</div>
                <h3>Message received</h3>
                <p>We will get back to you at {form.email} within 24 hours.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2 className="contact-form-title">Send a Message</h2>

                <div className="contact-form-row">
                  <div className="contact-field">
                    <label>Your name <span>*</span></label>
                    <input
                      type="text"
                      placeholder="Arjun Sharma"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                    />
                  </div>
                  <div className="contact-field">
                    <label>Email address <span>*</span></label>
                    <input
                      type="email"
                      placeholder="arjun@example.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label>Message <span>*</span></label>
                  <textarea
                    rows={6}
                    placeholder="Tell us what you need…"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                  />
                </div>

                {error && <p className="contact-error">{error}</p>}

                <button type="submit" className="contact-btn">Send Message</button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
