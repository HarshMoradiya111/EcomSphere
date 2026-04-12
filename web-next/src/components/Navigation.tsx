'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null; // Admin has its own sidebar

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-6 font-sans">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-black text-teal-950 tracking-tighter uppercase group">
            Ecom<span className="text-teal-600 transition-colors group-hover:text-black italic">Sphere</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/' ? 'text-teal-600' : 'text-gray-400 hover:text-black transition-colors'}`}>Market</Link>
          <Link href="/blog" className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/blog' ? 'text-teal-600' : 'text-gray-400 hover:text-black transition-colors'}`}>Journal</Link>
          <Link href="/cart" className={`text-[10px] font-black uppercase tracking-widest ${pathname === '/cart' ? 'text-rose-500' : 'text-gray-400 hover:text-black transition-colors'}`}>Bag</Link>
        </div>

        <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="px-6 py-2.5 rounded-full bg-teal-600/10 text-teal-700 font-black text-[9px] uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all shadow-sm">Admin Control</Link>
        </div>
      </div>
    </nav>
  );
}
