'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
  { name: 'Products', path: '/admin/products', icon: '📦' },
  { name: 'Orders', path: '/admin/orders', icon: '🛒' },
  { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
  { name: 'Marketing', path: '/admin/marketing', icon: '📢' },
  { name: 'Segments', path: '/admin/customers/segments', icon: '🎯' },
  { name: 'Blogs', path: '/admin/blogs', icon: '📝' },
  { name: 'FAQs', path: '/admin/faqs', icon: '❓' },
  { name: 'Users', path: '/admin/users', icon: '👤' },
  { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          E
        </div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
          EcomSphere
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
              pathname === item.path
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">🚪</span>
          <span className="font-semibold">Exit Admin</span>
        </button>
      </div>
    </div>
  );
}
