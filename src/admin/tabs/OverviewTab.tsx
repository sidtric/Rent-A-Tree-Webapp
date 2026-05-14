import type { AdminStats, AdminTree, AdminRental, AdminReview } from '../types';

interface Props {
  stats: AdminStats | null;
  trees: AdminTree[];
  rentals: AdminRental[];
  reviews: AdminReview[];
}

function KpiGrid({ stats, trees, rentals }: Pick<Props, 'stats' | 'trees' | 'rentals'>) {
  return (
    <div className="adm-kpi-grid">
      <div className="adm-kpi adm-kpi--green">
        <div className="adm-kpi-icon">💰</div>
        <div className="adm-kpi-val">₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}</div>
        <div className="adm-kpi-label">Revenue (est.)</div>
        <div className="adm-kpi-sub">{stats?.cancelledRentals ?? 0} cancellation(s)</div>
      </div>
      <div className="adm-kpi adm-kpi--amber">
        <div className="adm-kpi-icon">🌳</div>
        <div className="adm-kpi-val">{stats?.totalTrees ?? trees.length}</div>
        <div className="adm-kpi-label">Total Trees</div>
        <div className="adm-kpi-sub">{stats?.availableTrees ?? '—'} available · {stats?.rentedTrees ?? '—'} rented</div>
      </div>
      <div className="adm-kpi adm-kpi--blue">
        <div className="adm-kpi-icon">📋</div>
        <div className="adm-kpi-val">{stats?.totalRentals ?? rentals.length}</div>
        <div className="adm-kpi-label">Total Rentals</div>
        <div className="adm-kpi-sub">{stats?.activeRentals ?? '—'} active</div>
      </div>
      <div className="adm-kpi adm-kpi--purple">
        <div className="adm-kpi-icon">👥</div>
        <div className="adm-kpi-val">{stats?.users ?? '—'}</div>
        <div className="adm-kpi-label">Registered Users</div>
        <div className="adm-kpi-sub">{stats?.totalOrders ?? '—'} box orders</div>
      </div>
    </div>
  );
}

function TreesByPlan({ trees }: { trees: AdminTree[] }) {
  return (
    <div className="adm-card">
      <h2 className="adm-card-title">Trees by Plan</h2>
      {(['sapling', 'adult', 'grand'] as const).map(plan => {
        const count = trees.filter(t => t.plan === plan).length;
        const pct = trees.length > 0 ? (count / trees.length) * 100 : 0;
        return (
          <div key={plan} className="adm-bar-row">
            <span className={`adm-plan-badge adm-plan--${plan}`}>{plan}</span>
            <div className="adm-bar-track">
              <div className={`adm-bar-fill adm-bar--${plan}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="adm-bar-num">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewRatings({ reviews }: { reviews: AdminReview[] }) {
  return (
    <div className="adm-card">
      <h2 className="adm-card-title">Review Ratings</h2>
      {[5, 4, 3, 2, 1].map(n => {
        const count = reviews.filter(r => r.rating === n).length;
        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return (
          <div key={n} className="adm-bar-row">
            <span className="adm-star-label">{'★'.repeat(n)}</span>
            <div className="adm-bar-track">
              <div className="adm-bar-fill adm-bar--star" style={{ width: `${pct}%` }} />
            </div>
            <span className="adm-bar-num">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function RecentRentals({ rentals }: { rentals: AdminRental[] }) {
  return (
    <div className="adm-card">
      <h2 className="adm-card-title">Recent Rentals</h2>
      {rentals.length === 0 ? (
        <p className="adm-empty">No rentals yet.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr><th>Customer</th><th>Plan</th><th>Variety</th><th>Season</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {rentals.slice(0, 8).map(r => (
              <tr key={r._id}>
                <td>
                  <div className="adm-td-user">
                    <div className="adm-avatar">{(r.user?.name || 'U')[0].toUpperCase()}</div>
                    <div>
                      <div className="adm-td-name">{r.user?.name || '—'}</div>
                      <div className="adm-td-dim">{r.user?.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`adm-plan-badge adm-plan--${r.plan}`}>{r.plan}</span></td>
                <td className="adm-td-dim">{r.variety}</td>
                <td>{r.season}</td>
                <td><span className={`adm-status adm-status--${r.status}`}>● {r.status}</span></td>
                <td className="adm-td-date">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function OverviewTab({ stats, trees, rentals, reviews }: Props) {
  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Dashboard</h1>
          <p className="adm-sub">Live snapshot of YourOrchard operations</p>
        </div>
        <div className="adm-season-badge">🌿 Season 2026</div>
      </header>

      <KpiGrid stats={stats} trees={trees} rentals={rentals} />

      <div className="adm-row-2">
        <TreesByPlan trees={trees} />
        <ReviewRatings reviews={reviews} />
      </div>

      <RecentRentals rentals={rentals} />
    </div>
  );
}
