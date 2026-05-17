import { useState, useEffect } from 'react';
import { API_BASE } from '../../lib/api';
import DropZone from '../components/DropZone';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
}

interface HeroMedia { url: string; type: 'image' | 'video' }
interface TreeUpdate { _id: string; caption: string; media: { url: string; type: 'image' | 'video' }[]; createdAt: string }

const RESPONSE_KEY: Record<string, string> = {
  'hero-media':      'heroMedia',
  'farm-hero-media': 'farmHeroMedia',
  'sapling-media':   'saplingMedia',
  'adult-media':     'adultMedia',
  'grand-media':     'grandMedia',
};

// ── Reusable media section (hero / tree photos) ──────────────────────────
function MediaSection({
  title, subtitle, endpoint, media, onUpdate, flash,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  media: HeroMedia[];
  onUpdate: (items: HeroMedia[]) => void;
  flash: (msg: string) => void;
}) {
  const [uploading, setUploading]     = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const resKey = RESPONSE_KEY[endpoint];

  async function handleUpload(files: FileList) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach(f => form.append('media', f));
      const res = await fetch(`${API_BASE}/api/admin/settings/${endpoint}`, {
        method: 'POST', headers: authHeaders(), body: form,
      }).then(r => r.json());
      if (res[resKey]) { onUpdate(res[resKey]); flash(`${files.length} item(s) added!`); }
      else flash(res.message || 'Upload failed.');
    } catch { flash('Upload failed.'); }
    finally { setUploading(false); }
  }

  async function handleDelete(index: number) {
    setDeletingIdx(index);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/${endpoint}/${index}`, {
        method: 'DELETE', headers: authHeaders(),
      }).then(r => r.json());
      if (res[resKey] !== undefined) { onUpdate(res[resKey]); flash('Removed.'); }
      else flash(res.message || 'Failed to remove.');
    } catch { flash('Failed to remove.'); }
    finally { setDeletingIdx(null); }
  }

  const imageCount = media.filter(m => m.type === 'image').length;
  const videoCount = media.filter(m => m.type === 'video').length;

  return (
    <div className="adm-card" style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 className="adm-card-title" style={{ marginBottom: 4 }}>{title}</h2>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 12px' }}>{subtitle}</p>
        {media.length > 0 && (
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0 0 12px' }}>
            {`${media.length} item${media.length > 1 ? 's' : ''} · ${videoCount} video${videoCount !== 1 ? 's' : ''} · ${imageCount} photo${imageCount !== 1 ? 's' : ''} · First item shown on site`}
          </p>
        )}
        <DropZone
          onFiles={handleUpload}
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          multiple
          disabled={uploading}
          compact={media.length > 0}
        />
        {uploading && <p style={{ fontSize: '0.8rem', color: '#2d5a27', margin: '8px 0 0', fontWeight: 600 }}>Uploading…</p>}
      </div>

      {media.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {media.map((item, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111' }}>
                {item.type === 'video'
                  ? <video src={item.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                <div style={{ position: 'absolute', top: 6, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                  {item.type === 'video' ? '▶ VIDEO' : '📷 PHOTO'}
                </div>
                <div style={{ position: 'absolute', top: 6, right: 8, background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>
                  #{i + 1}
                </div>
              </div>
              <button
                onClick={() => handleDelete(i)}
                disabled={deletingIdx === i}
                style={{
                  width: '100%', padding: '8px 0',
                  background: deletingIdx === i ? '#f9fafb' : '#fff',
                  color: deletingIdx === i ? '#9ca3af' : '#dc2626',
                  border: 'none', borderTop: '1px solid #fee2e2',
                  fontSize: '0.8rem', fontWeight: 600,
                  cursor: deletingIdx === i ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (deletingIdx !== i) (e.target as HTMLButtonElement).style.background = '#fef2f2'; }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#fff'; }}
              >
                {deletingIdx === i ? 'Removing…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Your Tree This Week section ──────────────────────────────────────────
const VARIETIES = [
  { key: 'chausa',  label: 'Chausa Aam' },
  { key: 'dasheri', label: 'Dasheri Aam' },
  { key: 'langra',  label: 'Langra Aam' },
] as const;

type Variety = 'chausa' | 'dasheri' | 'langra';

function YourTreeSection({ flash }: { flash: (m: string) => void }) {
  const [variety, setVariety]   = useState<Variety>('chausa');
  const [updates, setUpdates]   = useState<Record<Variety, TreeUpdate[]>>({ chausa: [], dasheri: [], langra: [] });
  const [fetched, setFetched]   = useState<Record<Variety, boolean>>({ chausa: false, dasheri: false, langra: false });
  const [loading, setLoading]   = useState(false);
  const [caption, setCaption]   = useState('');
  const [files, setFiles]       = useState<FileList | null>(null);
  const [posting, setPosting]   = useState(false);
  const [deletingId, setDel]    = useState<string | null>(null);

  useEffect(() => {
    if (fetched[variety]) return;
    setLoading(true);
    fetch(`${API_BASE}/api/public-updates?variety=${variety}`)
      .then(r => r.json())
      .then(data => {
        // only keep updates that are specifically tagged for this variety (exclude untagged farm posts)
        const tagged = (data as TreeUpdate[]).filter((u: any) => u.variety === variety);
        setUpdates(prev => ({ ...prev, [variety]: tagged }));
        setFetched(prev => ({ ...prev, [variety]: true }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [variety, fetched]);

  async function handlePost() {
    if (!files || files.length === 0) { flash('Select at least one photo or video'); return; }
    setPosting(true);
    try {
      const data = new FormData();
      data.append('caption', caption);
      data.append('variety', variety);
      Array.from(files).forEach(f => data.append('media', f));
      const res = await fetch(`${API_BASE}/api/public-updates`, {
        method: 'POST',
        headers: authHeaders(),
        body: data,
      }).then(r => r.json());
      if (res._id) {
        setUpdates(prev => ({ ...prev, [variety]: [res, ...prev[variety]] }));
        setCaption(''); setFiles(null);
        flash(`Posted to ${variety} tree dashboard!`);
      } else {
        flash(res.message || 'Upload failed');
      }
    } finally { setPosting(false); }
  }

  async function handleDelete(id: string) {
    setDel(id);
    try {
      await fetch(`${API_BASE}/api/admin/public-updates/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      setUpdates(prev => ({ ...prev, [variety]: prev[variety].filter(u => u._id !== id) }));
      flash('Deleted.');
    } catch { flash('Delete failed.'); }
    finally { setDel(null); }
  }

  const current = updates[variety];

  return (
    <div className="adm-card" style={{ marginBottom: 28 }}>
      <h2 className="adm-card-title" style={{ marginBottom: 4 }}>Your Tree This Week</h2>
      <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 20px' }}>
        Variety-tagged updates — appear in the customer's dashboard under "Your Tree This Week"
      </p>

      {/* Variety tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {VARIETIES.map(v => (
          <button
            key={v.key}
            onClick={() => setVariety(v.key)}
            style={{
              padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600, borderRadius: 6,
              border: variety === v.key ? 'none' : '1px solid #e5e7eb',
              background: variety === v.key ? '#2d5a27' : '#fff',
              color: variety === v.key ? '#fff' : '#555',
              cursor: 'pointer',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Post form */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }}>
        <textarea
          rows={2}
          placeholder={`e.g. Chausa trees in full bloom at Block B — your mango is coming along beautifully 🌿`}
          value={caption}
          onChange={e => setCaption(e.target.value)}
          style={{ width: '100%', resize: 'vertical', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.875rem', marginBottom: 10, boxSizing: 'border-box' }}
        />
        <DropZone
          onFiles={f => setFiles(f)}
          accept="image/*,video/*"
          multiple
          disabled={posting}
          staged={files}
          compact
        />
        <button
          className="adm-btn-primary"
          onClick={handlePost}
          disabled={posting}
          style={{ flexShrink: 0, marginTop: 10 }}
        >
          {posting ? 'Posting…' : `Post to ${variety.charAt(0).toUpperCase() + variety.slice(1)} Dashboard`}
        </button>
      </div>

      {/* Existing updates */}
      {loading ? (
        <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Loading…</p>
      ) : current.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: '0.875rem' }}>No updates posted for {variety} yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {current.map(u => (
            <div key={u._id} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              {u.media[0] && (
                <div style={{ aspectRatio: '4/3', background: '#111', overflow: 'hidden' }}>
                  {u.media[0].type === 'video'
                    ? <video src={u.media[0].url} muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <img src={u.media[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
              )}
              <div style={{ padding: '10px 12px' }}>
                {u.caption && <p style={{ fontSize: '0.8rem', color: '#374151', margin: '0 0 6px', lineHeight: 1.4 }}>{u.caption}</p>}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 8px' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <button
                  onClick={() => handleDelete(u._id)}
                  disabled={deletingId === u._id}
                  style={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626', background: 'none', border: '1px solid #fca5a5', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}
                >
                  {deletingId === u._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────────────
export default function SiteSettingsTab({ flash }: { flash: (msg: string) => void }) {
  const [heroMedia,     setHeroMedia]     = useState<HeroMedia[]>([]);
  const [farmHeroMedia, setFarmHeroMedia] = useState<HeroMedia[]>([]);
  const [saplingMedia,  setSaplingMedia]  = useState<HeroMedia[]>([]);
  const [adultMedia,    setAdultMedia]    = useState<HeroMedia[]>([]);
  const [grandMedia,    setGrandMedia]    = useState<HeroMedia[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/settings`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        setHeroMedia(d.heroMedia     || []);
        setFarmHeroMedia(d.farmHeroMedia || []);
        setSaplingMedia(d.saplingMedia  || []);
        setAdultMedia(d.adultMedia      || []);
        setGrandMedia(d.grandMedia      || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Site Settings</h1>
          <p className="adm-sub">Manage hero backgrounds, tree dashboard photos, and weekly updates</p>
        </div>
      </header>

      {loading ? <p style={{ color: '#aaa' }}>Loading…</p> : (
        <>
          {/* Section 1 — Homepage Hero */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>Hero Backgrounds</p>
          </div>
          <MediaSection
            title="Homepage Hero"
            subtitle="Cycles on the homepage background"
            endpoint="hero-media"
            media={heroMedia}
            onUpdate={setHeroMedia}
            flash={flash}
          />

          {/* Section 2 — Life on Farm Hero */}
          <MediaSection
            title="Life on Farm Hero"
            subtitle="Cycles behind the Farm Life page header"
            endpoint="farm-hero-media"
            media={farmHeroMedia}
            onUpdate={setFarmHeroMedia}
            flash={flash}
          />

          <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0 28px' }} />

          {/* Section 3 — Your Tree This Week */}
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>Dashboard Content</p>
          </div>
          <YourTreeSection flash={flash} />

          {/* Section 4 — Dashboard Tree Photos */}
          <div className="adm-card" style={{ marginBottom: 28 }}>
            <h2 className="adm-card-title" style={{ marginBottom: 4 }}>Trees in Dashboard</h2>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 20px' }}>
              Background photos shown on customer rental cards — first uploaded image is used
            </p>
            <MediaSection
              title="Sapling Tree"
              subtitle="Small tree rental card background"
              endpoint="sapling-media"
              media={saplingMedia}
              onUpdate={setSaplingMedia}
              flash={flash}
            />
            <MediaSection
              title="Adult Tree"
              subtitle="Mid tree rental card background"
              endpoint="adult-media"
              media={adultMedia}
              onUpdate={setAdultMedia}
              flash={flash}
            />
            <MediaSection
              title="Grand Tree"
              subtitle="Large tree rental card background"
              endpoint="grand-media"
              media={grandMedia}
              onUpdate={setGrandMedia}
              flash={flash}
            />
          </div>
        </>
      )}
    </div>
  );
}
