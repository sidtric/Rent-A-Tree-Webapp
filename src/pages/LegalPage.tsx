import './LegalPage.css';

interface Section {
  heading: string;
  content: string | string[];
}

interface Props {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalPage({ title, subtitle, lastUpdated, sections }: Props) {
  return (
    <div className="legal">
      <div className="legal-inner">
        <div className="legal-header">
          <h1 className="legal-title">{title}</h1>
          <p className="legal-sub">{subtitle}</p>
          <span className="legal-updated">Last updated: {lastUpdated}</span>
        </div>
        <div className="legal-body">
          {sections.map((s, i) => (
            <section key={i} className="legal-section">
              <h2 className="legal-section-title">{s.heading}</h2>
              {Array.isArray(s.content) ? (
                <ul className="legal-list">
                  {s.content.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              ) : (
                <p className="legal-para">{s.content}</p>
              )}
            </section>
          ))}
        </div>
        <div className="legal-contact">
          <p>Questions? Reach us at <a href="mailto:support.YourOrchard@gmail.com">support.YourOrchard@gmail.com</a> or call <a href="tel:+917535850398">+91 75358 50398</a>.</p>
        </div>
      </div>
    </div>
  );
}
