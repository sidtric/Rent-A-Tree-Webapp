import { useState } from 'react';
import type { AdminPublicUpdate } from '../types';
import { API_BASE } from '../../lib/api';
import DropZone from '../components/DropZone';

interface Props {
  publicUpdates: AdminPublicUpdate[];
  addPublicUpdate: (u: AdminPublicUpdate) => void;
  deletePublicUpdate: (id: string) => Promise<void>;
  flash: (msg: string) => void;
}

function PostForm({ onPosted, flash }: { onPosted: (u: AdminPublicUpdate) => void; flash: (m: string) => void }) {
  const [caption, setCaption] = useState('');
  const [files, setFiles]     = useState<FileList | null>(null);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!files || files.length === 0) { flash('Select at least one photo or video'); return; }
    setPosting(true);
    try {
      const data = new FormData();
      data.append('caption', caption);
      Array.from(files).forEach(f => data.append('media', f));
      const token = localStorage.getItem('token');
      const r = await fetch(`${API_BASE}/api/public-updates`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: data,
      });
      let res: any = {};
      try { res = await r.json(); } catch { res = { message: `HTTP ${r.status}` }; }
      if (r.ok && res._id) {
        onPosted(res);
        setCaption(''); setFiles(null);
        flash('Posted to Life on Farm!');
      } else {
        flash(res.message || `Upload failed (HTTP ${r.status})`);
      }
    } catch (err: any) {
      flash(err?.message || 'Upload error');
    } finally { setPosting(false); }
  };

  return (
    <div className="adm-card adm-form-card">
      <h2 className="adm-card-title">Post New Update</h2>
      <div className="adm-form-grid">
        <div className="adm-field adm-field--wide">
          <label>Caption (optional)</label>
          <textarea
            rows={3}
            placeholder="Mangoes are ripening beautifully this week at Block A 🌿"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
        </div>
        <div className="adm-field adm-field--wide">
          <DropZone
            onFiles={f => setFiles(f)}
            accept="image/*,video/*"
            multiple
            disabled={posting}
            staged={files}
          />
        </div>
      </div>
      <button className="adm-btn-primary" onClick={handlePost} disabled={posting}>
        {posting ? 'Uploading…' : 'Post to Life on Farm'}
      </button>
    </div>
  );
}

function UpdateCard({ update, onDelete }: { update: AdminPublicUpdate; onDelete: () => void }) {
  return (
    <div className="adm-card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <p style={{ fontSize: '0.9rem', color: '#444', flex: 1 }}>
          {update.caption || <em style={{ color: '#aaa' }}>No caption</em>}
        </p>
        <button className="adm-btn-danger-sm" onClick={onDelete}>Delete</button>
      </div>
      <div className="adm-farm-photos-grid">
        {update.media?.map((m, i) => (
          <div key={i} className="adm-farm-photo-card">
            {m.type === 'image'
              ? <img src={m.url} alt="farm" />
              : <video src={m.url} controls style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublicUpdatesTab({ publicUpdates, addPublicUpdate, deletePublicUpdate, flash }: Props) {
  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Life on Farm</h1>
          <p className="adm-sub">Post photos & videos visible to all visitors</p>
        </div>
      </header>

      <PostForm onPosted={addPublicUpdate} flash={flash} />

      <div style={{ marginTop: 32 }}>
        {publicUpdates.map(update => (
          <UpdateCard key={update._id} update={update} onDelete={() => deletePublicUpdate(update._id)} />
        ))}
        {publicUpdates.length === 0 && <p className="adm-empty">No updates yet.</p>}
      </div>
    </div>
  );
}
