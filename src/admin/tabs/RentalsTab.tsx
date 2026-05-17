import { useState } from 'react';
import type { AdminRental } from '../types';

const RENTAL_STATUSES = ['pending_payment', 'active', 'completed', 'cancelled'];

const RENTAL_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  active:          'Active',
  completed:       'Completed',
  cancelled:       'Cancelled',
};

const VARIETY_LABELS: Record<string, string> = {
  chausa:  'Chausa Aam',
  dasheri: 'Dasheri Aam',
  langra:  'Langra Aam',
};

const PLAN_LABELS: Record<string, string> = {
  sapling: 'Sapling',
  adult:   'Adult',
  grand:   'Grand',
};

interface Props {
  rentals: AdminRental[];
  updateRentalStatus: (id: string, status: string) => Promise<unknown>;
}

function RentalRow({ rental, onStatusChange }: { rental: AdminRental; onStatusChange: (s: string) => Promise<unknown> }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(s: string) {
    setSaving(true);
    await onStatusChange(s).catch(() => {});
    setSaving(false);
  }

  return (
    <tr>
      <td>
        <div className="adm-td-user">
          <div className="adm-avatar">{(rental.user?.name || 'U')[0].toUpperCase()}</div>
          <div>
            <div className="adm-td-name">{rental.user?.name || '—'}</div>
            <div className="adm-td-dim">{rental.user?.email || '—'}</div>
          </div>
        </div>
      </td>
      <td><span className={`adm-plan-badge adm-plan--${rental.plan}`}>{PLAN_LABELS[rental.plan] || rental.plan}</span></td>
      <td className="adm-td-dim">{VARIETY_LABELS[rental.variety] || rental.variety}</td>
      <td>{rental.season}</td>
      <td
        className="adm-td-dim"
        style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {rental.deliveryAddress}
      </td>
      <td>
        <select
          className="adm-status-select"
          value={rental.status}
          disabled={saving}
          onChange={e => handleChange(e.target.value)}
        >
          {RENTAL_STATUSES.map(s => <option key={s} value={s}>{RENTAL_STATUS_LABELS[s] || s}</option>)}
        </select>
      </td>
      <td className="adm-td-date">
        {new Date(rental.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
      </td>
    </tr>
  );
}

export default function RentalsTab({ rentals, updateRentalStatus }: Props) {
  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Rentals</h1>
          <p className="adm-sub">{rentals.length} total rentals</p>
        </div>
      </header>
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Customer</th><th>Plan</th><th>Variety</th>
              <th>Season</th><th>Address</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map(r => (
              <RentalRow key={r._id} rental={r} onStatusChange={s => updateRentalStatus(r._id, s)} />
            ))}
            {rentals.length === 0 && (
              <tr><td colSpan={7} className="adm-td-empty">No rentals yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
