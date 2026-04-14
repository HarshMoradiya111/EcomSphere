import Script from 'next/script';
import type { AdminHeaderPartialProps } from './types';

type NavItem = {
  href: string;
  icon: string;
  label: string;
  page?: string;
};

const navItems: NavItem[] = [
  { href: '/admin/dashboard', icon: 'fa-gauge', label: 'Dashboard', page: 'dashboard' },
  { href: '/admin/products', icon: 'fa-box', label: 'Products', page: 'products' },
  { href: '/admin/orders', icon: 'fa-shopping-bag', label: 'Orders', page: 'orders' },
  { href: '/admin/users', icon: 'fa-users', label: 'Users', page: 'users' },
  { href: '/admin/blogs', icon: 'fa-pen-to-square', label: 'Blogs', page: 'blogs' },
  { href: '/admin/coupons', icon: 'fa-tag', label: 'Coupons', page: 'coupons' },
  { href: '/admin/settings', icon: 'fa-gear', label: 'Settings', page: 'settings' },
  { href: '/admin/marketing', icon: 'fa-bullhorn', label: 'Marketing', page: 'marketing' },
  { href: '/admin/inventory', icon: 'fa-warehouse', label: 'Inventory', page: 'inventory' },
  { href: '/admin/faqs', icon: 'fa-circle-question', label: 'FAQ Management', page: 'faqs' },
  { href: '/admin/customers/segments', icon: 'fa-chart-pie', label: 'Customer Segments', page: 'segments' },
  { href: '/admin/customers/search-analytics', icon: 'fa-magnifying-glass-chart', label: 'Search Analytics', page: 'search-analytics' },
];

export default function AdminHeaderPartial({
  activePage,
  adminUsername,
  globalLowStockCount = 0,
}: AdminHeaderPartialProps) {
  return (
    <>
      <Script src="https://kit.fontawesome.com/db75cd62a8.js" crossOrigin="anonymous" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>🛍️ EcomSphere</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = item.page === activePage;
            const showLowStockBadge = item.page === 'inventory' && globalLowStockCount > 0;

            return (
              <a key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <i className={`fa-solid ${item.icon}`}></i>
                {' '}
                {item.label}
                {showLowStockBadge && (
                  <span
                    className="sidebar-badge"
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      marginLeft: 'auto',
                    }}
                  >
                    {globalLowStockCount}
                  </span>
                )}
              </a>
            );
          })}

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }} />
          <a href="/" className="nav-item" target="_blank" rel="noreferrer">
            <i className="fa-solid fa-globe"></i> View Site
          </a>
          <a href="/admin/logout" className="nav-item nav-logout">
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </a>
        </nav>
        <div className="sidebar-footer">
          <p>Logged in as <strong>{adminUsername || 'Admin'}</strong></p>
        </div>
      </aside>

    </>
  );
}
