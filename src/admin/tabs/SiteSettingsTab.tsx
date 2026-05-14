import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
}

interface HeroMedia { url: string; type: 'image' | 'video' }

// explicit map avoids key-derivation bugs
const RESPONSE_KEY: Record<string, string> = {
  'hero-media':      'heroMedia',
  'farm-hero-media': 'farmHeroMedia',
};

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
  const [uploading, setUploading]   = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resKey   = RESPONSE_KEY[endpoint];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
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
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
        <div>
          <h2 className="adm-card-title" style={{ marginBottom: 4 }}>{title}</h2>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>{subtitle}</p>
        </div>
        <label className="adm-btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, flexShrink: 0 }}>
          {uploading ? 'Uploading…' : '+ Add Photos / Videos'}
          <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        {media.length === 0
          ? 'No media — page shows static background.'
          : `${media.length} item${media.length > 1 ? 's' : ''} · ${videoCount} video${videoCount !== 1 ? 's' : ''} · ${imageCount} photo${imageCount !== 1 ? 's' : ''} · Videos play fully, photos show 5 s`}
      </p>

      {media.length === 0 ? (
        <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 10, padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>Upload photos and videos to replace the static background.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {media.map((item, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' }}>
              {/* Thumbnail */}
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
              {/* Delete button below thumbnail */}
              <button
                onClick={() => handleDelete(i)}
                disabled={deletingIdx === i}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  background: deletingIdx === i ? '#f9fafb' : '#fff',
                  color: deletingIdx === i ? '#9ca3af' : '#dc2626',
                  border: 'none',
                  borderTop: '1px solid #fee2e2',
                  fontSize: '0.8rem',
                  fontWeight: 600,
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

export default function SiteSettingsTab({ flash }: { flash: (msg: string) => void }) {
  const [heroMedia,     setHeroMedia]     = useState<HeroMedia[]>([]);
  const [farmHeroMedia, setFarmHeroMedia] = useState<HeroMedia[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/settings`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        setHeroMedia(d.heroMedia || []);
        setFarmHeroMedia(d.farmHeroMedia || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Site Settings</h1>
          <p className="adm-sub">Manage hero backgrounds for each page</p>
        </div>
      </header>

      {loading ? <p style={{ color: '#aaa' }}>Loading…</p> : (
        <>
          <MediaSection
            title="Homepage Hero"
            subtitle="Cycles on the homepage background"
            endpoint="hero-media"
            media={heroMedia}
            onUpdate={setHeroMedia}
            flash={flash}
          />
          <MediaSection
            title="Life on Farm Hero"
            subtitle="Cycles behind the Farm Life page header"
            endpoint="farm-hero-media"
            media={farmHeroMedia}
            onUpdate={setFarmHeroMedia}
            flash={flash}
          />
        </>
      )}
    </div>
  );
}
