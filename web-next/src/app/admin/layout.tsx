'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '../../features/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 🛡️ Stateless Guard: Verify JWT existence
    const token = localStorage.getItem('adminToken');
    const isLoginPage = pathname === '/admin/login';

    if (!token && !isLoginPage) {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  // Hide sidebar on login page for better UX
  const showSidebar = pathname !== '/admin/login';

  // Prevent flicker during redirect
  if (!authorized && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {showSidebar && <AdminSidebar />}

      <main className="flex-1 max-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
