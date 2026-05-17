import { useState } from 'react';
import { api } from '../api';
import type { AdminTree, TreeForm } from '../types';
import { EMPTY_TREE_FORM } from '../types';

interface Props {
  trees: AdminTree[];
  addTree: (t: AdminTree) => void;
  updateTree: (t: AdminTree) => void;
  removeTree: (id: string) => void;
  flash: (msg: string) => void;
}

interface FormProps {
  form: TreeForm;
  editing: AdminTree | null;
  saving: boolean;
  onChange: (f: TreeForm) => void;
  onSave: () => void;
  onCancel: () => void;
}

function TreeForm({ form, editing, saving, onChange, onSave, onCancel }: FormProps) {
  const set = (patch: Partial<TreeForm>) => onChange({ ...form, ...patch });
  return (
    <div className="adm-card adm-form-card">
      <h2 className="adm-card-title">{editing ? 'Edit Tree' : 'Add New Tree'}</h2>
      <div className="adm-form-grid">
        <div className="adm-field">
          <label>Plan *</label>
          <select value={form.plan} onChange={e => set({ plan: e.target.value as TreeForm['plan'] })}>
            <option value="sapling">Sapling</option>
            <option value="adult">Adult</option>
            <option value="grand">Grand</option>
          </select>
        </div>
        <div className="adm-field">
          <label>Variety *</label>
          <select value={form.variety} onChange={e => set({ variety: e.target.value as TreeForm['variety'] })}>
            <option value="chausa">Chausa Aam</option>
            <option value="dasheri">Dasheri Aam</option>
            <option value="langra">Langra Aam</option>
          </select>
        </div>
        <div className="adm-field">
          <label>Price (₹) *</label>
          <input type="number" placeholder="1499" value={form.price} onChange={e => set({ price: e.target.value })} />
        </div>
        <div className="adm-field">
          <label>Yield Min (kg) *</label>
          <input type="number" placeholder="15" value={form.yieldMin} onChange={e => set({ yieldMin: e.target.value })} />
        </div>
        <div className="adm-field">
          <label>Yield Max (kg)</label>
          <input type="number" placeholder="25" value={form.yieldMax} onChange={e => set({ yieldMax: e.target.value })} />
        </div>
        <div className="adm-field adm-field--check">
          <label>
            <input type="checkbox" checked={form.available} onChange={e => set({ available: e.target.checked })} />
            Available for rental
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="adm-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Update Tree' : 'Create Tree'}
        </button>
        {editing && (
          <button className="adm-btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
}

function TreeRow({ tree, onEdit, onDelete }: { tree: AdminTree; onEdit: () => void; onDelete: () => void }) {
  return (
    <tr>
      <td><span className={`adm-plan-badge adm-plan--${tree.plan}`}>{tree.plan}</span></td>
      <td className="adm-td-bold">{tree.variety}</td>
      <td>₹{tree.price?.toLocaleString('en-IN')}</td>
      <td>{tree.yieldMin}–{tree.yieldMax} kg</td>
      <td>
        <span className={`adm-status adm-status--${tree.available ? 'avail' : 'rented'}`}>
          {tree.available ? '● Available' : '● Rented'}
        </span>
      </td>
      <td>
        <div className="adm-action-row">
          <button className="adm-btn-sm" onClick={onEdit}>Edit</button>
          <button className="adm-btn-danger-sm" onClick={onDelete}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

export default function TreesTab({ trees, addTree, updateTree, removeTree, flash }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [treeForm, setTreeForm] = useState<TreeForm>(EMPTY_TREE_FORM);
  const [editing, setEditing]   = useState<AdminTree | null>(null);
  const [saving, setSaving]     = useState(false);

  const startAdd = () => { setEditing(null); setTreeForm(EMPTY_TREE_FORM); setShowForm(f => !f); };
  const startEdit = (t: AdminTree) => {
    setTreeForm({ plan: t.plan, variety: t.variety, price: String(t.price), yieldMin: String(t.yieldMin), yieldMax: String(t.yieldMax), available: t.available });
    setEditing(t);
    setShowForm(true);
  };
  const cancelForm = () => { setShowForm(false); setEditing(null); setTreeForm(EMPTY_TREE_FORM); };

  const handleSave = async () => {
    if (!treeForm.price || !treeForm.yieldMin) { flash('Price and Yield Min are required'); return; }
    setSaving(true);
    try {
      const body = { plan: treeForm.plan, variety: treeForm.variety, price: Number(treeForm.price), yieldMin: Number(treeForm.yieldMin), yieldMax: Number(treeForm.yieldMax), available: treeForm.available };
      if (editing) {
        const res = await api.patchBody(`/admin/trees/${editing._id}`, body);
        if (res._id) { updateTree(res); flash('Tree updated!'); }
        else flash(res.message || 'Update failed');
      } else {
        const res = await api.post('/trees', body);
        if (res._id) { addTree(res); flash('Tree created!'); }
        else flash(res.message || 'Create failed');
      }
      cancelForm();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await api.del(`/admin/trees/${id}`);
    removeTree(id);
    flash('Tree deleted');
  };

  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Trees</h1>
          <p className="adm-sub">{trees.length} trees in inventory</p>
        </div>
        <button className="adm-btn-primary" onClick={startAdd}>
          {showForm && !editing ? '✕ Cancel' : '+ Add Tree'}
        </button>
      </header>

      {showForm && (
        <TreeForm form={treeForm} editing={editing} saving={saving} onChange={setTreeForm} onSave={handleSave} onCancel={cancelForm} />
      )}

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr><th>Plan</th><th>Variety</th><th>Price</th><th>Yield</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {trees.map(t => (
              <TreeRow key={t._id} tree={t} onEdit={() => startEdit(t)} onDelete={() => handleDelete(t._id)} />
            ))}
            {trees.length === 0 && (
              <tr><td colSpan={6} className="adm-td-empty">No trees in inventory</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
