import { useState } from 'react';
import { useAdminData } from './hooks/useAdminData';
import { ADMIN_TABS } from './types';
import type { AdminTab } from './types';
import OverviewTab      from './tabs/OverviewTab';
import TreesTab         from './tabs/TreesTab';
import RentalsTab       from './tabs/RentalsTab';
import OrdersTab        from './tabs/OrdersTab';
import PublicUpdatesTab from './tabs/PublicUpdatesTab';
import ReviewsTab       from './tabs/ReviewsTab';
import MessagesTab      from './tabs/MessagesTab';
import UserRolesTab     from './tabs/UserRolesTab';
import PaymentsTab      from './tabs/PaymentsTab';
import SiteSettingsTab  from './tabs/SiteSettingsTab';
import './admin.css';

interface Props {
  onExit: () => void;
  user: { name: string; email: string };
}

export default function AdminDashboard({ onExit, user }: Props) {
  const [tab, setTab]               = useState<AdminTab>('overview');
  const [msg, setMsg]               = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    trees, rentals, orders, reviews, messages, publicUpdates, stats,
    updateRentalStatus, updateOrderStatus,
    deleteReview, deleteMessage, deletePublicUpdate,
    addPublicUpdate, addTree, updateTree, removeTree,
  } = useAdminData();

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };
  const go    = (t: AdminTab) => { setTab(t); setMobileOpen(false); };

  return (
    <div className="adm-shell">
      {msg && <div className="toast adm-toast" onClick={() => setMsg('')}>{msg}</div>}

      {/* Sidebar */}
      <aside className={`adm-sidebar ${mobileOpen ? 'adm-sidebar--open' : ''}`}>
        <div className="adm-sidebar-top">
          <div className="adm-logo">YourOrchard</div>
          <div className="adm-role-pill">Admin Panel</div>
        </div>
        <nav className="adm-nav">
          {ADMIN_TABS.map(t => (
            <button
              key={t.id}
              className={`adm-nav-btn ${tab === t.id ? 'adm-nav-btn--active' : ''}`}
              onClick={() => go(t.id)}
            >
              <span className="adm-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <div className="adm-user-row">
            <div className="adm-avatar adm-avatar--lg">{user.name[0].toUpperCase()}</div>
            <div className="adm-user-info">
              <div className="adm-user-name">{user.name}</div>
              <div className="adm-user-email">{user.email}</div>
            </div>
          </div>
          <button className="adm-exit-btn" onClick={onExit}>← Back to Site</button>
        </div>
      </aside>

      {/* Mobile bar */}
      <div className="adm-mobile-bar">
        <button className="adm-hamburger" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
        <span className="adm-mobile-title">
          {ADMIN_TABS.find(t => t.id === tab)?.icon} {ADMIN_TABS.find(t => t.id === tab)?.label}
        </span>
        <button className="adm-exit-btn-sm" onClick={onExit}>Exit</button>
      </div>

      {/* Main content */}
      <main className="adm-main">
        {tab === 'overview'      && <OverviewTab stats={stats} trees={trees} rentals={rentals} reviews={reviews} />}
        {tab === 'trees'         && <TreesTab trees={trees} addTree={addTree} updateTree={updateTree} removeTree={removeTree} flash={flash} />}
        {tab === 'rentals'       && <RentalsTab rentals={rentals} updateRentalStatus={updateRentalStatus} />}
        {tab === 'orders'        && <OrdersTab orders={orders} updateOrderStatus={updateOrderStatus} />}
        {tab === 'publicupdates' && <PublicUpdatesTab publicUpdates={publicUpdates} addPublicUpdate={addPublicUpdate} deletePublicUpdate={deletePublicUpdate} flash={flash} />}
        {tab === 'reviews'       && <ReviewsTab reviews={reviews} deleteReview={deleteReview} />}
        {tab === 'messages'      && <MessagesTab messages={messages} deleteMessage={deleteMessage} />}
        {tab === 'userroles'     && <UserRolesTab flash={flash} />}
        {tab === 'payments'      && <PaymentsTab />}
        {tab === 'sitesettings'  && <SiteSettingsTab flash={flash} />}
      </main>
    </div>
  );
}
