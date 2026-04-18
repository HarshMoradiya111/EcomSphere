'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_URL } from '@/src/config';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-solid fa-gauge', id: 'dashboard' },
  { name: 'Products', path: '/admin/products', icon: 'fa-solid fa-box', id: 'products' },
  { name: 'Orders', path: '/admin/orders', icon: 'fa-solid fa-shopping-bag', id: 'orders' },
  { name: 'Users', path: '/admin/users', icon: 'fa-solid fa-users', id: 'users' },
  { name: 'Blogs', path: '/admin/blogs', icon: 'fa-solid fa-pen-to-square', id: 'blogs' },
  { name: 'Coupons', path: '/admin/coupons', icon: 'fa-solid fa-tag', id: 'coupons' },
  { name: 'Settings', path: '/admin/settings', icon: 'fa-solid fa-gear', id: 'settings' },
  { name: 'Marketing', path: '/admin/marketing', icon: 'fa-solid fa-bullhorn', id: 'marketing' },
  { name: 'Inventory', path: '/admin/inventory', icon: 'fa-solid fa-warehouse', id: 'inventory' },
  { name: 'FAQ Management', path: '/admin/faqs', icon: 'fa-solid fa-circle-question', id: 'faqs' },
  { name: 'Customer Segments', path: '/admin/customers/segments', icon: 'fa-solid fa-chart-pie', id: 'segments' },
  { name: 'Search Analytics', path: '/admin/customers/search-analytics', icon: 'fa-solid fa-magnifying-glass-chart', id: 'search-analytics' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState('Admin');
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (user) {
      try {
        if (user.startsWith('{')) {
          const parsed = JSON.parse(user);
          setAdminUser(parsed.username || parsed.name || 'Admin');
        } else {
          setAdminUser(user);
        }
      } catch {
        setAdminUser(user);
      }
    }

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/api/v1/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setLowStockCount(data.stats.zeroStockCount || 0);
            }
        } catch (e) {}
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  return (
    <aside className="d-flex flex-column h-100 bg-dark text-white p-3">
      <div className="mb-4 text-center">
        <h4 className="fw-bold mb-1">🛍️ EcomSphere</h4>
        <small className="text-muted text-uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>Admin Node</small>
      </div>

      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <li className="nav-item" key={item.path}>
              <Link
                href={item.path}
                className={`nav-link d-flex align-items-center gap-3 text-white ${isActive ? 'active bg-primary' : ''}`}
                style={{ borderRadius: '8px' }}
              >
                <i className={`${item.icon} fa-fw`}></i>
                <span className="flex-grow-1">{item.name}</span>
                {item.id === 'inventory' && lowStockCount > 0 && (
                  <span className="badge bg-danger rounded-pill">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        
        <hr className="my-3 text-secondary" />
        
        <li className="nav-item">
          <Link 
            href="/" 
            target="_blank"
            className="nav-link d-flex align-items-center gap-3 text-white"
          >
            <i className="fa-solid fa-globe fa-fw"></i>
            <span>View Public Site</span>
          </Link>
        </li>
        
        <li className="nav-item mt-2">
          <button
            onClick={handleLogout}
            className="nav-link w-100 text-start d-flex align-items-center gap-3 text-danger border-0 bg-transparent"
          >
            <i className="fa-solid fa-right-from-bracket fa-fw"></i>
            <span>Terminate Session</span>
          </button>
        </li>
      </ul>

      <div className="mt-auto pt-3 border-top border-secondary text-center">
        <small className="text-muted">Operational Agent:</small>
        <div className="fw-bold text-white">{adminUser}</div>
      </div>
    </aside>
  );
}
