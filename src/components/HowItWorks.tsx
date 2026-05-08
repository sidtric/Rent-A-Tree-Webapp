import './HowItWorks.css';

const STEPS = [
  {
    number: '01',
    title: 'Choose Your Tree',
    desc: 'Pick a mango variety — Chausa, Dasheri, or Langra — and select your tree size. We have trees for every family.',
  },
  {
    number: '02',
    title: 'We Grow & Care',
    desc: 'Our orchardists in Ramnagar tend your tagged tree all season. You get weekly photos and videos straight to your dashboard.',
  },
  {
    number: '03',
    title: 'Harvest Delivered',
    desc: 'When the mangoes are ripe, we handpick and dispatch your harvest within 24 hours — fresh from your tree to your door.',
  },
];

export default function HowItWorks() {
  return (
    <section className="hiw">
      <div className="hiw-inner">
        <div className="hiw-header">
          <span className="hiw-label">Simple Process</span>
          <h2 className="hiw-title">How It Works</h2>
          <p className="hiw-sub">Three steps to owning a harvest without owning a farm.</p>
        </div>

        <div className="hiw-cards">
          {STEPS.map((step, i) => (
            <div key={step.number} className="hiw-card">
              <div className="hiw-card-top">
                <span className="hiw-number">{step.number}</span>
              </div>
              <h3 className="hiw-card-title">{step.title}</h3>
              <p className="hiw-card-desc">{step.desc}</p>
              {i < STEPS.length - 1 && <div className="hiw-connector" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
