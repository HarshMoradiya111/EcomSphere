'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/src/features/admin/AdminSidebar';

const titles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/blogs': 'Blogs',
  '/admin/coupons': 'Coupons',
  '/admin/settings': 'Settings',
  '/admin/marketing': 'Marketing',
  '/admin/inventory': 'Inventory',
  '/admin/faqs': 'FAQ Management',
  '/admin/customers/segments': 'Customer Segments',
  '/admin/customers/search-analytics': 'Search Analytics',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (user) setAdminUser(user);
    
    const isLoginPage = pathname === '/admin/login';

    if (!token && !isLoginPage) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  const showSidebar = pathname !== '/admin/login';
  const pageTitle = titles[pathname] || 'Admin Panel';

  if (!authorized && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-[#f1f5f9]">
      {showSidebar && <AdminSidebar />}

      <main className={`flex-1 min-h-screen ${showSidebar ? 'ml-[260px]' : ''}`}>
        {showSidebar && (
          <div className="flex items-center justify-between p-[20px_30px] bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
            <div className="flex items-center gap-[15px]">
              <button id="sidebar-toggle" className="bg-none border-none text-[#ffd700] text-[20px] cursor-pointer hidden md:block lg:hidden">
                <i className="fa-solid fa-bars"></i>
              </button>
              <h1 className="text-[20px] font-[700] text-[#f1f5f9]">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-[15px]">
              <span className="bg-[rgba(255,215,0,0.1)] text-[#ffd700] p-[6px_14px] rounded-[20px] text-[13px] font-[600]">
                <i className="fa-solid fa-user-shield mr-1"></i> {adminUser}
              </span>
            </div>
          </div>
        )}
        
        <div className={showSidebar ? 'p-0' : ''}>
          {children}
        </div>
      </main>
    </div>
  );
}
