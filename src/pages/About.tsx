import './About.css';

const TEAM = [
  {
    name: 'Arjun Rawat',
    role: 'Co-founder & Tech',
    bg: 'My grandfather had a mango bagiche in Ramnagar. I grew up spending summers there. Now I build software — but I never stopped thinking about those trees.',
  },
  {
    name: 'Priya Negi',
    role: 'Co-founder & Operations',
    bg: 'My family has been farming in the Kumaon hills for three generations. I studied computer science, worked at a startup in Bengaluru, and came back to do something that actually connects to the land.',
  },
  {
    name: 'Rahul Bisht',
    role: 'Head of Orchard',
    bg: 'I have been tending orchards in Ramnagar for over fifteen years. I know every tree by feel. YourOrchard is my chance to let the whole country meet them.',
  },
];

const VALUES = [
  {
    title: 'No Chemicals',
    desc: 'Every tree on our farm is grown without synthetic pesticides or fertilisers. Natural farming, full season.',
  },
  {
    title: 'Full Transparency',
    desc: 'You know exactly which tree is yours, where it stands, and how it is doing. Weekly photos and videos, no exceptions.',
  },
  {
    title: 'Fair to the Farmer',
    desc: 'We cut out every middleman between the orchard and your door. More for the orchardist, fresher for you.',
  },
  {
    title: 'Tree-Ripened Only',
    desc: 'We never pick early or use artificial ripening. Your harvest comes off the tree when it is actually ready.',
  },
];

export default function About() {
  return (
    <div className="about">

      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-label">Our Story</span>
          <h1 className="about-hero-title">We are techies.<br />We are also farmers' kids.</h1>
          <p className="about-hero-sub">
            YourOrchard started in Ramnagar, Uttarakhand — where the soil is rich, the air smells of mango blossoms in spring, and some of us grew up watching fruit get picked and sold for almost nothing at the local mandi.
          </p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-text">
            <span className="about-label">How We Got Here</span>
            <h2>Built from both sides of the harvest</h2>
            <p>
              We are a small team of builders, marketers, and orchardists — all with farming somewhere in our roots. We grew up in Uttarakhand, moved to cities, learned to code and run products, but never stopped thinking about the orchards back home.
            </p>
            <p>
              Every year, we watched the same thing happen. Mangoes ripened perfectly on the trees. Farmers worked all season with real care. And then the fruit went to the mandi, passed through four or five hands, and the farmer got a fraction of what it was worth — while the customer in the city got something that was already three days old.
            </p>
            <p>
              We built YourOrchard to fix that in the most direct way we could think of: let the customer own the tree. Let the farmer get paid fairly upfront. And send the harvest straight from the orchard to the door.
            </p>
            <p>
              We are not romanticising farming. We know it is hard, unpredictable, and historically undervalued. That is exactly why we built this.
            </p>
          </div>
          <div className="about-story-img">
            <img src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80" alt="Mango orchard in Ramnagar" />
          </div>
        </div>
      </section>

      <section className="about-farm">
        <div className="about-farm-inner">
          <div className="about-farm-text">
            <span className="about-label">The Orchard</span>
            <h2>Ramnagar, Uttarakhand</h2>
            <p>
              Our farm sits at the edge of Corbett country in the Kumaon foothills. The elevation is right, the soil holds water well, and the trees here have been producing some of the finest Chausa, Dasheri, and Langra mangoes in the country for decades.
            </p>
            <p>
              We work with orchardists who have been farming this land for two generations. They know every tree by name. They do not use chemicals. They pick by feel, not by calendar.
            </p>
            <p>
              When you rent a tree on YourOrchard, you are connected to this specific place and these specific people — not a warehouse, not a cold chain, not a brand.
            </p>
          </div>
          <div className="about-farm-stats">
            <div className="about-stat">
              <div className="about-stat-num">3</div>
              <div className="about-stat-label">Mango varieties</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">200+</div>
              <div className="about-stat-label">Trees on farm</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">2</div>
              <div className="about-stat-label">Generations of farmers</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">0</div>
              <div className="about-stat-label">Chemicals used</div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-inner">
          <div className="about-values-header">
            <span className="about-label">What We Stand For</span>
            <h2>Our Commitments</h2>
          </div>
          <div className="about-values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="about-value-card">
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
