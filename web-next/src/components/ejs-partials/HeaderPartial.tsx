'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import type { HeaderPartialProps } from './types';
import Link from 'next/link';

function resolveLogoSrc(logo?: string | null): string {
  if (!logo || !logo.trim()) {
    return `${API_URL}/img/logo.png`;
  }
  const value = logo.trim();
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${API_URL}${value}`;
  }
  return `${API_URL}/uploads/${value}`;
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
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const logoSrc = resolveLogoSrc(settings?.logo);

  // Handle Responsive Width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync session user
  useEffect(() => {
    let cancelled = false;
    if (sessionUser) {
      setResolvedSessionUser(sessionUser);
      return;
    }
    async function detectSessionUser() {
      try {
        const response = await fetch(`${API_URL}/api/v1/user/profile`, { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        if (data.success && data.user) {
          setResolvedSessionUser(data.user.username);
        }
      } catch { /* Guest */ }
    }
    void detectSessionUser();
    return () => { cancelled = true; };
  }, [sessionUser]);

  // Sync cart count from API
  const fetchCartCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cart) {
          setCartCount(data.cart.length);
        }
      }
    } catch (err) {
      console.error('Cart count fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCartCount();
    const interval = setInterval(fetchCartCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setDrawerOpen(false);
    }
  };

  // --- Inline Styles ---
  const styles = {
    header: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: isMobile ? '60px' : '72px',
      backgroundColor: '#ffffff',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      boxSizing: 'border-box' as const,
      borderBottom: '1px solid #f0f0f0',
    },
    container: {
      width: '100%',
      maxWidth: '1440px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      height: isMobile ? '32px' : '40px',
      width: 'auto',
      display: 'block',
    },
    searchWrapper: {
      flex: 1,
      maxWidth: '400px',
      margin: '0 40px',
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '24px',
      padding: '8px 16px',
      position: 'relative' as const,
    },
    searchInput: {
      width: '100%',
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: '14px',
      paddingLeft: '10px',
      color: '#2d3436',
    },
    nav: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      gap: '8px',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    navItem: (isActive: boolean, color = '#2d3436') => ({
      padding: '8px 14px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 600,
      color: isActive ? '#088178' : color,
      background: isActive ? '#e8f8f7' : 'transparent',
      textDecoration: 'none',
      whiteSpace: 'nowrap' as const,
      transition: '0.2s ease',
    }),
    iconButton: {
      padding: '8px',
      color: '#2d3436',
      textDecoration: 'none',
      fontSize: '20px',
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute' as const,
      top: '0px',
      right: '0px',
      backgroundColor: '#088178',
      color: '#ffffff',
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '2px 6px',
      borderRadius: '10px',
      border: '2px solid #ffffff',
    },
    mobileRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    drawerOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
      opacity: drawerOpen ? 1 : 0,
      pointerEvents: drawerOpen ? 'auto' as const : 'none' as const,
      transition: 'opacity 0.3s ease',
    },
    drawer: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      height: '100%',
      width: '280px',
      backgroundColor: '#ffffff',
      zIndex: 2001,
      boxShadow: '0 0 20px rgba(0,0,0,0.2)',
      transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    drawerHeader: {
      background: 'linear-gradient(135deg, #088178 0%, #044f4a 100%)',
      padding: '24px',
      color: '#ffffff',
    },
    drawerLink: (isActive: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 600,
      color: isActive ? '#088178' : '#2d3436',
      background: isActive ? '#e8f8f7' : 'transparent',
      textDecoration: 'none',
      borderLeft: isActive ? '4px solid #088178' : '4px solid transparent',
    })
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          
          {/* Mobile Only: Hamburger */}
          {isMobile && (
            <button 
              onClick={() => setDrawerOpen(true)}
              style={{ ...styles.iconButton, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-bars-staggered"></i>
            </button>
          )}

          {/* Logo - Centered on Mobile, Left on Desktop */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoSrc} style={styles.logo} alt="EcomSphere" />
          </Link>

          {/* Desktop Search */}
          <div style={styles.searchWrapper}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#999' }}></i>
            <form onSubmit={handleSearch} style={{ flex: 1 }}>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <ul style={styles.nav}>
            <li><Link href="/" style={styles.navItem(activePage === 'home')}>Home</Link></li>
            <li><Link href="/shop" style={styles.navItem(activePage === 'shop')}>Shop</Link></li>
            <li><Link href="/blog" style={styles.navItem(activePage === 'blog')}>Blog</Link></li>
            <li><Link href="/about" style={styles.navItem(activePage === 'about')}>About</Link></li>
            <li><Link href="/contact" style={styles.navItem(activePage === 'contact')}>Contact</Link></li>
            {resolvedSessionUser ? (
              <>
                <li><Link href="/profile" style={styles.navItem(activePage === 'profile')}>Profile</Link></li>
                <li><Link href="/auth/logout" style={styles.navItem(false, '#ef4444')}>Logout</Link></li>
              </>
            ) : (
              <li><Link href="/auth/login" style={styles.navItem(false)}>Login</Link></li>
            )}
            {showAdminLink && <li><a href="/admin/dashboard" style={styles.navItem(false, '#6366f1')}>Admin</a></li>}
          </ul>

          {/* Right Icons (Always visible) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '12px' }}>
            <Link href="/cart" style={styles.iconButton}>
              <i className="fa-solid fa-bag-shopping"></i>
              {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
            </Link>
            {isMobile && (
              <Link href={resolvedSessionUser ? "/profile" : "/auth/login"} style={styles.iconButton}>
                <i className="fa-regular fa-user"></i>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Search Row (Full width below header) */}
      {isMobile && (
        <div style={{ 
          position: 'fixed', 
          top: '60px', 
          left: 0, 
          width: '100%', 
          padding: '10px 20px', 
          backgroundColor: '#ffffff', 
          zIndex: 999,
          borderBottom: '1px solid #f0f0f0',
          boxSizing: 'border-box'
        }}>
          <form onSubmit={handleSearch} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px', 
            padding: '8px 12px' 
          }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#999', fontSize: '12px' }}></i>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...styles.searchInput, paddingLeft: '8px', fontSize: '13px' }}
            />
          </form>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: isMobile ? '112px' : '72px' }}></div>

      {/* Side Drawer Overlay */}
      <div style={styles.drawerOverlay} onClick={() => setDrawerOpen(false)} />

      {/* Side Drawer */}
      <aside style={styles.drawer}>
        <div style={styles.drawerHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                   <i className="fa-solid fa-user" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Welcome,</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{resolvedSessionUser || 'Guest User'}</p>
                </div>
             </div>
             <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
               <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
          {!resolvedSessionUser && (
            <Link href="/auth/login" onClick={() => setDrawerOpen(false)} style={{ display: 'block', width: '100%', textAlign: 'center' as const, backgroundColor: '#fff', color: '#088178', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
              Login / Register
            </Link>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          <p style={{ padding: '0 24px', fontSize: '11px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu</p>
          <Link href="/" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'home')}><i className="fa-solid fa-house" style={{ width: '30px' }}></i> Home</Link>
          <Link href="/shop" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'shop')}><i className="fa-solid fa-bag-shopping" style={{ width: '30px' }}></i> Shop</Link>
          <Link href="/blog" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'blog')}><i className="fa-solid fa-newspaper" style={{ width: '30px' }}></i> Blog</Link>
          <div style={{ height: '1px', backgroundColor: '#eee', margin: '16px 24px' }}></div>
          <Link href="/profile" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'profile')}><i className="fa-solid fa-user-gear" style={{ width: '30px' }}></i> My Profile</Link>
          <Link href="/cart" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(false)}><i className="fa-solid fa-cart-shopping" style={{ width: '30px' }}></i> My Cart</Link>
          <Link href="/about" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'about')}><i className="fa-solid fa-info-circle" style={{ width: '30px' }}></i> About Us</Link>
          <Link href="/contact" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'contact')}><i className="fa-solid fa-headset" style={{ width: '30px' }}></i> Contact</Link>
        </div>

        {resolvedSessionUser && (
          <div style={{ padding: '24px', borderTop: '1px solid #eee' }}>
            <Link href="/auth/logout" onClick={() => setDrawerOpen(false)} style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-power-off"></i> Sign Out
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
