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

    // Dynamic style loading for Admin panel (Bootstrap 5)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    link.id = 'bootstrap-admin-theme';
    document.head.appendChild(link);

    // Dynamic JS loading for Bootstrap
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
    script.id = 'bootstrap-admin-script';
    document.body.appendChild(script);

    return () => {
      const existingLink = document.getElementById('bootstrap-admin-theme');
      if (existingLink) document.head.removeChild(existingLink);
      const existingScript = document.getElementById('bootstrap-admin-script');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, [router, pathname]);

  const isLoginPage = pathname === '/admin/login';

  if (!isAdmin && !isLoginPage) return null;

  if (isLoginPage) {
    return (
      <div className="admin-panel-root min-vh-100">
        <style>{`
          @font-face {
            font-family: 'Deltha';
            src: url('/fonts/Deltha.otf') format('opentype'),
                 url('/fonts/Deltha.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          .admin-panel-root {
            font-family: 'Deltha', sans-serif !important;
          }
        `}</style>
        {children}
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 bg-light min-vh-100">
      <style>{`
        @font-face {
          font-family: 'Deltha';
          src: url('/fonts/Deltha.otf') format('opentype'),
               url('/fonts/Deltha.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .admin-panel-root {
          font-family: 'Deltha', system-ui, -apple-system, sans-serif !important;
        }

        .admin-panel-root h1, 
        .admin-panel-root h2, 
        .admin-panel-root h3, 
        .admin-panel-root h4, 
        .admin-panel-root h5, 
        .admin-panel-root h6,
        .admin-panel-root .navbar-brand,
        .admin-panel-root .btn,
        .admin-panel-root .nav-link,
        .admin-panel-root table {
          font-family: 'Deltha', sans-serif !important;
        }

        .btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          filter: brightness(1.05);
        }
        .btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
        .nav-pills .nav-link {
          transition: all 0.3s ease;
        }
        .nav-pills .nav-link:hover:not(.active) {
          transform: translateX(4px);
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <div className="row g-0 h-100 admin-panel-root">
        <div className="col-auto bg-dark border-end" style={{ minWidth: '250px' }}>
          <AdminSidebar />
        </div>
        <div className="col d-flex flex-column" style={{ height: '100vh', overflowY: 'auto' }}>
          <header className="navbar navbar-expand-lg navbar-dark bg-dark px-4 py-3 shadow-sm sticky-top">
            <div className="container-fluid">
              <h1 className="navbar-brand text-uppercase mb-0 fs-6 fw-bold tracking-widest text-muted">Administrative Terminal</h1>
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-primary text-white p-2 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-user-shield"></i>
                  {adminUser}
                </span>
              </div>
            </div>
          </header>
          
          <main className="p-4 bg-light flex-grow-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
