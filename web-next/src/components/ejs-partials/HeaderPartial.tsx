'use client';

import { useEffect, useState } from 'react';
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
  const [resolvedSessionUser, setResolvedSessionUser] = useState<string | null>(sessionUser);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const logoSrc = resolveLogoSrc(settings?.logo);

  useEffect(() => {
    let cancelled = false;

    if (sessionUser) {
      setResolvedSessionUser(sessionUser);
      return;
    }

    async function detectSessionUser() {
      try {
        const response = await fetch(`${API_URL}/profile`, { credentials: 'include' });
        if (!response.ok) return;

        const html = await response.text();
        if (cancelled) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headingText = doc.querySelector('#page-header h2')?.textContent || '';
        const matched = headingText.match(/Welcome,\s*(.+)!/i);
        if (matched?.[1]) {
          setResolvedSessionUser(matched[1].trim());
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
          <img src={logoSrc} className="logo" alt="EcomSphere" height={45} />
        </a>

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
      <div style={{ height: '85px' }}></div>

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
