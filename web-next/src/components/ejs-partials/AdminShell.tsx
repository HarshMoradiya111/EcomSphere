import type { ReactNode } from 'react';
import AdminFooterPartial from './AdminFooterPartial';
import AdminHeaderPartial from './AdminHeaderPartial';

type Props = {
  children: ReactNode;
  title: string;
  activePage?: string;
  adminUsername?: string | null;
  globalLowStockCount?: number;
};

export default function AdminShell({
  children,
  title,
  activePage,
  adminUsername,
  globalLowStockCount = 0,
}: Props) {
  return (
    <div className="admin-layout">
      <AdminHeaderPartial title={title} activePage={activePage} adminUsername={adminUsername} globalLowStockCount={globalLowStockCount} />
      <main className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              id="sidebar-toggle"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'none',
              }}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 className="page-title">{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="admin-badge"><i className="fa-solid fa-user-shield"></i> {adminUsername || 'Admin'}</span>
          </div>
        </div>
        {children}
      </main>
      <AdminFooterPartial />
    </div>
  );
}
