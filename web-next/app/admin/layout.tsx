'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Head from 'next/head';
import AdminSidebar from '@/src/features/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const isLoginPage = pathname === '/admin/login';

    if (!token && !isLoginPage) {
      router.push('/admin/login');
    } else if (token) {
      setIsAdmin(true);
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
    }

    // Dynamic style loading for Admin panel
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/admin.css';
    link.id = 'admin-legacy-theme';
    document.head.appendChild(link);


    return () => {
      const existingLink = document.getElementById('admin-legacy-theme');
    if (existingLink) document.head.removeChild(existingLink);
    };
  }, [router, pathname]);

  const isLoginPage = pathname === '/admin/login';

  if (!isAdmin && !isLoginPage) return null;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-4">
            <h1 className="text-white text-[12px] font-[900] tracking-[0.3em] uppercase opacity-40">Administrative Terminal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="badge-pill flex items-center gap-2">
              <i className="fa-solid fa-user-shield text-[var(--accent)]"></i>
              <span className="text-white tracking-widest">{adminUser}</span>
            </div>
          </div>
        </header>
        
        <section className="admin-viewport">
          {children}
        </section>
      </main>
    </div>
  );
}
