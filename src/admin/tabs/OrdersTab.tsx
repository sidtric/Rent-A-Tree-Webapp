import { useState } from 'react';
import type { AdminOrder } from '../types';

const ORDER_STATUSES = ['pending_payment', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  confirmed:       'Confirmed',
  dispatched:      'Dispatched',
  delivered:       'Delivered',
  cancelled:       'Cancelled',
};

const VARIETY_LABELS: Record<string, string> = {
  chausa:  'Chausa Aam',
  dasheri: 'Dasheri Aam',
  langra:  'Langra Aam',
};

interface Props {
  orders: AdminOrder[];
  updateOrderStatus: (id: string, status: string) => Promise<unknown>;
}

function OrderRow({ order, onStatusChange }: { order: AdminOrder; onStatusChange: (s: string) => Promise<unknown> }) {
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
          <div className="adm-avatar">{(order.user?.name || 'U')[0].toUpperCase()}</div>
          <div>
            <div className="adm-td-name">{order.user?.name || '—'}</div>
            <div className="adm-td-dim">{order.user?.email || '—'}</div>
          </div>
        </div>
      </td>
      <td className="adm-td-bold">{VARIETY_LABELS[order.variety] || order.variety}</td>
      <td>{order.quantity} box{order.quantity > 1 ? 'es' : ''}</td>
      <td>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
      <td
        className="adm-td-dim"
        style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {order.deliveryAddress}
      </td>
      <td>
        <select
          className="adm-status-select"
          value={order.status}
          disabled={saving}
          onChange={e => handleChange(e.target.value)}
        >
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s] || s}</option>)}
        </select>
      </td>
      <td className="adm-td-date">
        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
      </td>
    </tr>
  );
}

export default function OrdersTab({ orders, updateOrderStatus }: Props) {
  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Box Orders</h1>
          <p className="adm-sub">{orders.length} total orders</p>
        </div>
      </header>
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Customer</th><th>Variety</th><th>Qty</th>
              <th>Total</th><th>Address</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <OrderRow key={o._id} order={o} onStatusChange={s => updateOrderStatus(o._id, s)} />
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="adm-td-empty">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
