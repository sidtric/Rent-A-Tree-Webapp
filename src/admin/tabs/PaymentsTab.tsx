import { usePayments } from '../hooks/useAdminData';

const STATUS_LABELS: Record<string, string> = {
  captured: 'Captured',
  failed: 'Failed',
  refunded: 'Refunded',
  authorized: 'Authorized',
  created: 'Pending',
};

function PayKpiRow({ captured, total, payments }: { captured: number; total: number; payments: any[] }) {
  return (
    <div className="adm-pay-kpis">
      <div className="adm-pay-kpi">
        <div className="adm-pay-kpi-icon adm-pay-kpi-icon--green">💰</div>
        <div className="adm-pay-kpi-body">
          <div className="adm-pay-kpi-val">₹{captured.toLocaleString('en-IN')}</div>
          <div className="adm-pay-kpi-lbl">Revenue Captured</div>
        </div>
      </div>
      <div className="adm-pay-kpi">
        <div className="adm-pay-kpi-icon adm-pay-kpi-icon--blue">📋</div>
        <div className="adm-pay-kpi-body">
          <div className="adm-pay-kpi-val">{total}</div>
          <div className="adm-pay-kpi-lbl">Total Transactions</div>
        </div>
      </div>
      <div className="adm-pay-kpi">
        <div className="adm-pay-kpi-icon adm-pay-kpi-icon--amber">✅</div>
        <div className="adm-pay-kpi-body">
          <div className="adm-pay-kpi-val">{payments.filter((p: any) => p.status === 'captured').length}</div>
          <div className="adm-pay-kpi-lbl">Successful</div>
        </div>
      </div>
      <div className="adm-pay-kpi">
        <div className="adm-pay-kpi-icon adm-pay-kpi-icon--red">❌</div>
        <div className="adm-pay-kpi-body">
          <div className="adm-pay-kpi-val">{payments.filter((p: any) => p.status === 'failed').length}</div>
          <div className="adm-pay-kpi-lbl">Failed</div>
        </div>
      </div>
    </div>
  );
}

function PaymentRow({ payment }: { payment: any }) {
  return (
    <tr>
      <td><span className="adm-pay-id" title={payment.id}>{payment.id}</span></td>
      <td><span className="adm-pay-amount">₹{payment.amount?.toLocaleString('en-IN')}</span></td>
      <td>
        <span className={`adm-pay-badge adm-pay-badge--${payment.status}`}>
          <span className="adm-pay-badge-dot" />
          {STATUS_LABELS[payment.status] || payment.status}
        </span>
      </td>
      <td><span className="adm-pay-method">{payment.method || '—'}</span></td>
      <td>
        {payment.rental?.user
          ? <><div className="adm-pay-customer-name">{payment.rental.user.name}</div><div className="adm-pay-customer-email">{payment.rental.user.email}</div></>
          : <div className="adm-pay-customer-email">{payment.email || '—'}</div>}
      </td>
      <td>
        {payment.rental
          ? <div className="adm-pay-rental-tree">{payment.rental.plan} · {payment.rental.variety}</div>
          : <span className="adm-pay-customer-email">—</span>}
      </td>
      <td>
        <span className="adm-pay-date">
          {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </td>
    </tr>
  );
}

export default function PaymentsTab() {
  const { payments, totalCaptured, total, loading, error, count, setCount, fetchPayments } = usePayments();

  return (
    <div className="adm-pay-page">
      <div className="adm-pay-header">
        <div className="adm-pay-header-left">
          <h2>💳 Payments</h2>
          <p>Live data from Razorpay — {payments.length > 0 ? `${payments.length} transactions` : 'No data loaded yet'}</p>
        </div>
      </div>

      <div className="adm-pay-bar">
        <label>Show</label>
        <select value={count} onChange={e => setCount(Number(e.target.value))}>
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>Last {n} payments</option>)}
        </select>
        <button className="adm-pay-refresh" onClick={() => fetchPayments(count)} disabled={loading}>
          {loading ? <><span className="spin" />Loading…</> : payments.length ? '↻ Refresh' : '↻ Load Payments'}
        </button>
      </div>

      {error && <div className="adm-pay-error">⚠️ {error}</div>}

      {payments.length > 0 && (
        <>
          <PayKpiRow captured={totalCaptured} total={total} payments={payments} />
          <div className="adm-pay-table-card">
            <div className="adm-pay-table-head">
              <h3>Transaction History</h3>
              <span className="adm-pay-count-pill">{payments.length} records</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-pay-table">
                <thead>
                  <tr>
                    <th>Payment ID</th><th>Amount</th><th>Status</th>
                    <th>Method</th><th>Customer</th><th>Rental</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => <PaymentRow key={p.id} payment={p} />)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && payments.length === 0 && !error && (
        <div className="adm-pay-table-card">
          <div className="adm-pay-empty">
            <div className="adm-pay-empty-icon">💳</div>
            <h4>No payments loaded</h4>
            <p>Click "Load Payments" to fetch live data from Razorpay.</p>
          </div>
        </div>
      )}
    </div>
  );
}
