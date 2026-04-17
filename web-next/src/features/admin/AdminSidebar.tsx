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
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <h2>🛍️ EcomSphere</h2>
        <p>Administrative Node</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={item.icon}></i>
              <span className="flex-1">{item.name}</span>
              {item.id === 'inventory' && lowStockCount > 0 && (
                <span className="badge-pill !bg-[var(--danger)] !text-white !border-none !text-[9px] !px-1.5 !py-0.5">
                  {lowStockCount}
                </span>
              )}
            </Link>
          );
        })}
        
        <div className="h-[1px] bg-[var(--border)] my-4 mx-4"></div>
        
        <Link 
          href="/" 
          target="_blank"
          className="nav-item"
        >
          <i className="fa-solid fa-globe"></i>
          <span className="flex-1">View Public Site</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="nav-item nav-logout"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span className="flex-1">Terminate Session</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <p>Operational Agent: <strong>{adminUser}</strong></p>
      </div>
    </aside>
  );
}
