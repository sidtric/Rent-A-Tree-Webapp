import './HowItWorks.css';

const STEPS = [
  {
    number: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" /><path d="M12 12C12 7 7 4 3 6" /><path d="M12 12C12 7 17 4 21 6" />
        <path d="M3 6c0 5 3 8 9 10" /><path d="M21 6c0 5-3 8-9 10" />
      </svg>
    ),
    title: 'Pick Your Variety & Plan',
    desc: 'Choose from Chausa Aam, Dasheri Aam, or Langra Aam. Then pick your tree size — Sapling (15–20 kg), Adult (30–45 kg), or Grand (60–80 kg). Every plan is a real, tagged tree on our Ramnagar farm.',
    tag: 'Step 1',
  },
  {
    number: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
    title: 'Pay & Confirm in Seconds',
    desc: 'Check out securely via Razorpay — UPI, cards, or net banking. Your booking is confirmed instantly and shows up in your dashboard. No paperwork, no calls.',
    tag: 'Step 2',
  },
  {
    number: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
    title: 'Watch Your Tree All Season',
    desc: 'Our orchardists in Ramnagar care for your tree throughout the season. You receive weekly photo and video updates straight from the farm — posted on your dashboard and on Life on the Farm.',
    tag: 'Step 3',
  },
  {
    number: '04',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12H3l9-9 9 9h-2" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        <path d="M10 22v-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6" />
      </svg>
    ),
    title: 'Harvest Delivered to Your Door',
    desc: 'When your mangoes are ripe, we handpick them and dispatch within 24 hours — straight from your tree to your doorstep. Free delivery, anywhere in India.',
    tag: 'Step 4',
  },
];

const STATS = [
  { value: '500+', label: 'Trees Rented' },
  { value: '2nd',  label: 'Generation Farm' },
  { value: '3',    label: 'Mango Varieties' },
  { value: '100%', label: 'Fresh Harvest' },
];

export default function HowItWorks() {
  function scrollToBrowse() {
    document.getElementById('browse-trees')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="hiw" id="how-it-works">

      {/* ── Stats bar ── */}
      <div className="hiw-stats-bar">
        {STATS.map((s, i) => (
          <div key={i} className="hiw-stat">
            <span className="hiw-stat-value">{s.value}</span>
            <span className="hiw-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="hiw-inner">
        <div className="hiw-header">
          <span className="hiw-label">Simple Process</span>
          <h2 className="hiw-title">How It Works</h2>
          <p className="hiw-sub">Four steps from choosing your tree to eating your mangoes.</p>
        </div>

        <div className="hiw-cards">
          {STEPS.map((step, i) => (
            <div key={step.number} className="hiw-card">
              <div className="hiw-card-top">
                <div className="hiw-icon">{step.icon}</div>
                <span className="hiw-number">{step.number}</span>
              </div>
              <span className="hiw-card-tag">{step.tag}</span>
              <h3 className="hiw-card-title">{step.title}</h3>
              <p className="hiw-card-desc">{step.desc}</p>
              {i < STEPS.length - 1 && <div className="hiw-connector" />}
            </div>
          ))}
        </div>

        {/* ── Trust strip ── */}
        <div className="hiw-trust-strip">
          <div className="hiw-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secured by Razorpay
          </div>
          <div className="hiw-trust-dot" />
          <div className="hiw-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Free delivery across India
          </div>
          <div className="hiw-trust-dot" />
          <div className="hiw-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            Weekly farm updates
          </div>
          <div className="hiw-trust-dot" />
          <div className="hiw-trust-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 7 7 4 3 6"/><path d="M12 12C12 7 17 4 21 6"/><path d="M3 6c0 5 3 8 9 10"/><path d="M21 6c0 5-3 8-9 10"/></svg>
            Real, tagged trees
          </div>
        </div>

        <div className="hiw-cta-row">
          <button className="hiw-cta" onClick={scrollToBrowse}>Browse Trees &amp; Rent Now</button>
          <p className="hiw-cta-note">Season 2026 · Harvest window May 15 – July 31 · Limited slots</p>
        </div>
      </div>
    </section>
  );
}
