'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-solid fa-gauge' },
  { name: 'Products', path: '/admin/products', icon: 'fa-solid fa-box' },
  { name: 'Orders', path: '/admin/orders', icon: 'fa-solid fa-shopping-bag' },
  { name: 'Users', path: '/admin/users', icon: 'fa-solid fa-users' },
  { name: 'Blogs', path: '/admin/blogs', icon: 'fa-solid fa-pen-to-square' },
  { name: 'Coupons', path: '/admin/coupons', icon: 'fa-solid fa-tag' },
  { name: 'Settings', path: '/admin/settings', icon: 'fa-solid fa-gear' },
  { name: 'Marketing', path: '/admin/marketing', icon: 'fa-solid fa-bullhorn' },
  { name: 'Inventory', path: '/admin/inventory', icon: 'fa-solid fa-warehouse' },
  { name: 'FAQ Management', path: '/admin/faqs', icon: 'fa-solid fa-circle-question' },
  { name: 'Customer Segments', path: '/admin/customers/segments', icon: 'fa-solid fa-chart-pie' },
  { name: 'Search Analytics', path: '/admin/customers/search-analytics', icon: 'fa-solid fa-magnifying-glass-chart' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState('Admin');

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (user) setAdminUser(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  return (
    <aside className="w-[260px] bg-[#1e293b] border-right border-[#334155] flex flex-col fixed top-0 left-0 h-screen overflow-y-auto z-[100] transition-transform">
      <div className="p-[24px_20px] border-b border-[#334155]">
        <h2 className="text-[20px] text-[#ffd700] font-[800]">🛍️ EcomSphere</h2>
        <p className="text-[12px] text-[#94a3b8] mt-[4px]">Admin Panel</p>
      </div>

      <nav className="p-[20px_12px] flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-[12px] p-[12px_16px] rounded-[8px] text-[14px] font-[500] mb-[4px] transition-all duration-200 ${
                isActive 
                  ? 'bg-[rgba(255,215,0,0.1)] text-[#ffd700] border-l-[3px] border-[#ffd700]' 
                  : 'text-[#94a3b8] hover:bg-white/5 hover:text-[#f1f5f9]'
              }`}
            >
              <i className={`${item.icon} text-[16px] w-[18px] text-center`}></i>
              {item.name}
            </Link>
          );
        })}
        
        <hr className="border-[rgba(255,255,255,0.1)] my-[15px]" />
        
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center gap-[12px] p-[12px_16px] rounded-[8px] text-[14px] font-[500] mb-[4px] text-[#94a3b8] hover:bg-white/5 hover:text-[#f1f5f9] transition-all"
        >
          <i className="fa-solid fa-globe text-[16px] w-[18px] text-center"></i>
          View Site
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-[12px] p-[12px_16px] rounded-[8px] text-[14px] font-[500] mb-[4px] text-[#ef4444] hover:bg-rose-500/10 transition-all text-left"
        >
          <i className="fa-solid fa-right-from-bracket text-[16px] w-[18px] text-center"></i>
          Logout
        </button>
      </nav>

      <div className="p-[16px_20px] border-t border-[#334155] text-[12px] text-[#94a3b8]">
        <p>Logged in as <strong>{adminUser}</strong></p>
      </div>
    </aside>
  );
}
