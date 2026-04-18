'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import type { HeaderPartialProps } from './types';

function resolveLogoSrc(logo?: string | null): string {
  if (!logo || !logo.trim()) {
    return '/img/logo1.png';
  }

  const value = logo.trim();
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  return `/uploads/${value}`;
}

export default function HeaderPartial({
  settings,
  activePage,
  sessionUser = null,
  showAdminLink = true,
}: HeaderPartialProps) {
  const router = useRouter();
  const [resolvedSessionUser, setResolvedSessionUser] = useState<string | null>(sessionUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const logoSrc = resolveLogoSrc(settings?.logo);

  useEffect(() => {
    let cancelled = false;

    // If sessionUser is passed as prop (server-side), use it.
    if (sessionUser) {
      setResolvedSessionUser(sessionUser);
      return;
    }

    // Otherwise, try to detect session from JSON API
    async function detectSessionUser() {
      try {
        const response = await fetch(`${API_URL}/api/v1/user/profile`, { credentials: 'include' });
        if (!response.ok) return;

        const data = await response.json();
        if (cancelled) return;

        if (data.success && data.user) {
          setResolvedSessionUser(data.user.username);
        }
      } catch {
        // Keep guest state when detection fails.
      }
    }

    void detectSessionUser();

    return () => {
      cancelled = true;
    };
  }, [sessionUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <section id="header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '15px 80px', 
        background: '#E3E6F3', 
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.06)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000
      }}>
        <a href="/">
          <img src={logoSrc} className="logo" alt="EcomSphere" height={40} />
        </a>

        {/* Mini Search Button/Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '20px', padding: '5px 15px', border: '1px solid #ddd', margin: '0 20px', flex: '0 1 300px' }}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
          />
          <button type="submit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#088178' }}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        <div id="nav-desktop">
          <ul id="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', listStyle: 'none' }}>
            <li><a href="/" className={activePage === 'home' ? 'active' : ''}>Home</a></li>
            <li><a href="/shop" className={activePage === 'shop' ? 'active' : ''}>Shop</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/about" className={activePage === 'about' ? 'active' : ''}>About</a></li>
            <li><a href="/contact" className={activePage === 'contact' ? 'active' : ''}>Contact</a></li>
            {resolvedSessionUser ? (
              <>
                <li><a href="/profile">Profile</a></li>
                <li><a href="/auth/logout">Logout ({resolvedSessionUser})</a></li>
              </>
            ) : (
              <li><a href="/auth/login">Login</a></li>
            )}
            {showAdminLink && <li><a href="/admin/dashboard">Admin</a></li>}
            <li id="lg-bag"><a href="/cart"><i className="fa-solid fa-cart-shopping" style={{ fontSize: '20px', color: '#1a1a1a' }}></i></a></li>
          </ul>
        </div>

        <div id="mobile">
          <a href="/cart"><i className="fa-solid fa-cart-shopping"></i></a>
          <i id="bar" className="fas fa-outdent" onClick={() => setDrawerOpen(true)}></i>
        </div>
      </section>

      {/* Spacer to prevent content from going under the fixed header */}
      <div style={{ height: '75px' }}></div>

      {/* Mobile Menu Drawer */}
      <nav id="navbar" className={drawerOpen ? 'active' : ''} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        position: 'fixed',
        top: 0,
        right: drawerOpen ? 0 : '-300px',
        height: '100vh',
        width: '300px',
        backgroundColor: '#E3E6F3',
        boxShadow: '0 40px 60px rgba(0,0,0,0.1)',
        padding: '80px 0 0 10px',
        transition: '0.3s',
        zIndex: 1001
      }}>
        <ul style={{ listStyle: 'none' }}>
            <li onClick={() => setDrawerOpen(false)} style={{ position: 'absolute', top: '30px', left: '30px', cursor: 'pointer' }}><i className="fas fa-times"></i></li>
            <li><a href="/" className={activePage === 'home' ? 'active' : ''}>Home</a></li>
            <li><a href="/shop" className={activePage === 'shop' ? 'active' : ''}>Shop</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/cart">Cart</a></li>
        </ul>
      </nav>
    </>
  );
}
