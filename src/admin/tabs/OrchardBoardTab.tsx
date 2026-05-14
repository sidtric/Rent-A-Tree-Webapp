import { useEffect, useState } from 'react';
import { apiFetch, API_BASE } from '../../lib/api';

interface RentedTree {
  _id: string;
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  season: string;
  userName: string;
}

const PLAN_META = {
  sapling: { label: 'Sapling Tree', size: 'Small Tree', fallback: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=600&q=80' },
  adult:   { label: 'Adult Tree',   size: 'Mid Tree',   fallback: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80' },
  grand:   { label: 'Grand Tree',   size: 'Big Tree',   fallback: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
};

const VARIETY_LABEL: Record<string, string> = { chausa: 'Chausa', dasheri: 'Dasheri', langra: 'Langra' };

const VARIETY_COLOR: Record<string, string> = {
  chausa:  '#fbbf24',
  dasheri: '#f97316',
  langra:  '#84cc16',
};

export default function OrchardBoardTab() {
  const [trees, setTrees]     = useState<RentedTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos]   = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    Promise.all([
      apiFetch<RentedTree[]>('/api/rentals/public'),
      fetch(`${API_BASE}/api/settings`).then(r => r.json()),
    ]).then(([rentals, settings]) => {
      setTrees(rentals);
      const p: Partial<Record<string, string>> = {};
      if (settings.saplingMedia?.[0]?.url) p.sapling = settings.saplingMedia[0].url;
      if (settings.adultMedia?.[0]?.url)   p.adult   = settings.adultMedia[0].url;
      if (settings.grandMedia?.[0]?.url)   p.grand   = settings.grandMedia[0].url;
      setPhotos(p);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const byVariety = ['chausa', 'dasheri', 'langra'].map(v => ({
    variety: v,
    count: trees.filter(t => t.variety === v).length,
  }));

  const siteUrl = (import.meta.env.VITE_SITE_URL as string) || 'http://localhost:5173';

  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-tab-title">Orchard Board</h2>
          <p className="adm-tab-sub">All active trees assigned to customers — this is the community section on the homepage.</p>
        </div>
        <a
          href={`${siteUrl}/#orchard-board`}
          target="_blank"
          rel="noreferrer"
          className="adm-btn adm-btn--primary"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          View on site ↗
        </a>
      </div>

      {/* Variety breakdown */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div className="adm-stat-card" style={{ flex: '1 1 140px' }}>
          <div className="adm-stat-num">{trees.length}</div>
          <div className="adm-stat-label">Total Active Trees</div>
        </div>
        {byVariety.map(({ variety, count }) => (
          <div key={variety} className="adm-stat-card" style={{ flex: '1 1 140px', borderTop: `3px solid ${VARIETY_COLOR[variety]}` }}>
            <div className="adm-stat-num">{count}</div>
            <div className="adm-stat-label">{VARIETY_LABEL[variety]}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading"><div className="adm-spinner" /></div>
      ) : trees.length === 0 ? (
        <div className="adm-empty">No active rentals yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {trees.map(r => {
            const plan = PLAN_META[r.plan];
            const img  = photos[r.plan] || plan.fallback;
            return (
              <div key={r._id} style={{
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                background: '#fff',
              }}>
                <div style={{
                  height: 120,
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', top: 8, left: 8,
                    background: VARIETY_COLOR[r.variety],
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 999,
                  }}>
                    {VARIETY_LABEL[r.variety]}
                  </span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 2 }}>
                    {r.userName}'s Tree
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{plan.label} · Season {r.season}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
