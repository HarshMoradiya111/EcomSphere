'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import { getToken } from '@/utils/auth';
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
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const logoSrc = resolveLogoSrc(settings?.logo);

  const NAV_CSS = `
    @keyframes nav-slide-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes drawer-item-fade {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes badge-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }

    .nav-link {
      position: relative;
      padding: 10px 16px;
      font-size: 14.5px;
      font-weight: 600;
      color: #2d3436;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 8px;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 16px;
      right: 16px;
      height: 2px;
      background: #088178;
      transform: scaleX(0);
      transition: transform 0.3s ease;
      transform-origin: right;
    }
    .nav-link:hover::after {
      transform: scaleX(1);
      transform-origin: left;
    }
    .nav-link:hover {
      color: #088178;
      background: rgba(8, 129, 120, 0.05);
    }
    .nav-link.active {
      color: #088178;
      background: #e8f8f7;
    }
    .nav-link.active::after {
      transform: scaleX(1);
    }

    .search-input-wrap {
      transition: all 0.3s ease;
      border: 1.5px solid transparent;
    }
    .search-input-wrap:focus-within {
      background: #ffffff !important;
      border-color: #088178;
      box-shadow: 0 4px 12px rgba(8, 129, 120, 0.1);
      transform: scale(1.02);
    }

    .icon-btn {
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .icon-btn:hover {
      transform: translateY(-2px) scale(1.1);
      color: #088178;
    }
    .icon-btn:active {
      transform: scale(0.95);
    }

    .cart-badge-pop {
      animation: badge-pop 0.4s ease-out;
    }

    .drawer-item {
      animation: drawer-item-fade 0.4s ease forwards;
      opacity: 0;
    }
    .header-main {
      height: 80px;
      transition: all 0.3s ease;
    }
    .header-logo {
      height: 44px;
    }
    .header-search {
      display: flex;
    }
    .header-nav {
      display: flex;
    }
    .mobile-search-row {
      display: none;
    }

    @media (max-width: 768px) {
      .header-main {
        height: 64px;
      }
      .header-logo {
        height: 34px;
      }
      .header-search {
        display: none !important;
      }
      .header-nav {
        display: none !important;
      }
      .mobile-search-row {
        display: block !important;
      }
    }
  `;

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
      const token = getToken();
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/v1/user/profile`, { 
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include' 
        });
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
    const token = getToken();
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/cart`, { 
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include' 
      });
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

  const fetchWishlistCount = async () => {
    const token = getToken();
    if (!token) {
      setWishlistCount(0);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/v1/user/wishlist`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.wishlist) {
          setWishlistCount(data.wishlist.length);
        }
      }
    } catch (err) {
      console.error('Wishlist count fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    
    const handleCartUpdate = () => fetchCartCount();
    const handleWishlistUpdate = () => fetchWishlistCount();
    
    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    
    const interval = setInterval(() => {
      fetchCartCount();
      fetchWishlistCount();
    }, 60000);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      clearInterval(interval);
    };
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
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      boxSizing: 'border-box' as const,
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
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
      width: 'auto',
      display: 'block',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))',
    },
    searchWrapper: {
      flex: 1,
      maxWidth: '440px',
      margin: '0 40px',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: '30px',
      padding: '10px 20px',
      position: 'relative' as const,
    },
    searchInput: {
      width: '100%',
      border: 'none',
      background: 'transparent',
      outline: 'none',
      fontSize: '14px',
      paddingLeft: '12px',
      color: '#1e293b',
      fontWeight: 500,
    },
    nav: {
      alignItems: 'center',
      gap: '4px',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    iconButton: {
      padding: '10px',
      color: '#475569',
      textDecoration: 'none',
      fontSize: '22px',
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    badge: {
      position: 'absolute' as const,
      top: '4px',
      right: '4px',
      backgroundColor: '#088178',
      color: '#ffffff',
      fontSize: '10px',
      fontWeight: '800',
      padding: '2px 5px',
      minWidth: '16px',
      height: '16px',
      borderRadius: '50%',
      border: '2px solid #ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(8,129,120,0.3)',
    },
    drawerOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      zIndex: 2000,
      backdropFilter: 'blur(8px)',
      opacity: drawerOpen ? 1 : 0,
      pointerEvents: drawerOpen ? 'auto' as const : 'none' as const,
      transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    drawer: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      height: '100%',
      width: '320px',
      backgroundColor: '#ffffff',
      zIndex: 2001,
      boxShadow: '20px 0 60px rgba(0,0,0,0.1)',
      transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    drawerHeader: {
      background: 'linear-gradient(135deg, #088178 0%, #044f4a 100%)',
      padding: '40px 24px 30px',
      color: '#ffffff',
      position: 'relative' as const,
    },
    drawerLink: (isActive: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '14px 24px',
      fontSize: '15px',
      fontWeight: 600,
      color: isActive ? '#088178' : '#475569',
      background: isActive ? 'linear-gradient(to right, #e8f8f7, transparent)' : 'transparent',
      textDecoration: 'none',
      borderLeft: isActive ? '4px solid #088178' : '4px solid transparent',
      transition: 'all 0.2s ease',
    })
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />
      <header style={styles.header} className="header-main">
        <div style={styles.container}>
          
          {/* Mobile Only: Hamburger */}
          <button 
            onClick={() => setDrawerOpen(true)}
            className="icon-btn lg:hidden"
            style={{ background: 'none', border: 'none', color: '#1e293b', fontSize: '24px', display: isMobile ? 'block' : 'none' }}
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.3s ease' }} className="icon-btn">
            <img src={logoSrc} style={styles.logo} alt="EcomSphere" className="header-logo" />
          </Link>

          {/* Desktop Search */}
          <div style={styles.searchWrapper} className="search-input-wrap header-search">
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#94a3b8', fontSize: '16px' }}></i>
            <form onSubmit={handleSearch} style={{ flex: 1 }}>
              <input 
                type="text" 
                placeholder="Search premium products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <ul style={styles.nav} className="header-nav">
            <li><Link href="/" className={`nav-link ${activePage === 'home' ? 'active' : ''}`}>Home</Link></li>
            <li><Link href="/shop" className={`nav-link ${activePage === 'shop' ? 'active' : ''}`}>Shop</Link></li>
            <li><Link href="/blog" className={`nav-link ${activePage === 'blog' ? 'active' : ''}`}>Blog</Link></li>
            <li><Link href="/about" className={`nav-link ${activePage === 'about' ? 'active' : ''}`}>About</Link></li>
            <li><Link href="/contact" className={`nav-link ${activePage === 'contact' ? 'active' : ''}`}>Contact</Link></li>
            {resolvedSessionUser ? (
              <>
                <li><Link href="/profile" className={`nav-link ${activePage === 'profile' ? 'active' : ''}`}>Profile</Link></li>
                <li><Link href="/auth/logout" className="nav-link" style={{ color: '#ef4444' }}>Logout</Link></li>
              </>
            ) : (
              <li style={{ marginLeft: '10px' }}>
                <Link href="/auth/login" className="nav-link" style={{ 
                  background: '#088178', 
                  color: '#fff', 
                  padding: '10px 24px', 
                  borderRadius: '30px',
                  boxShadow: '0 4px 12px rgba(8, 129, 120, 0.2)'
                }}>
                  Login
                </Link>
              </li>
            )}
            {showAdminLink && (
              <li>
                <a href="/admin/dashboard" className="nav-link" style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.05)' }}>
                  <i className="fa-solid fa-user-shield" style={{ fontSize: '13px' }}></i> Admin
                </a>
              </li>
            )}
          </ul>

          {/* Right Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            <Link href="/wishlist" className="iconButton icon-btn" style={{ ...styles.iconButton }}>
              <i className="fa-regular fa-heart"></i>
              {wishlistCount > 0 && <span style={{ ...styles.badge, backgroundColor: '#ef4444' }} className="cart-badge-pop">{wishlistCount}</span>}
            </Link>
            <Link href="/cart" className="iconButton icon-btn" style={styles.iconButton}>
              <i className="fa-solid fa-bag-shopping"></i>
              {cartCount > 0 && <span style={styles.badge} className="cart-badge-pop">{cartCount}</span>}
            </Link>
            {resolvedSessionUser && (
              <Link href="/profile" className="iconButton icon-btn" style={{ ...styles.iconButton, display: isMobile ? 'none' : 'flex' }}>
                 <i className="fa-regular fa-user-circle"></i>
              </Link>
            )}
            <Link href={resolvedSessionUser ? "/profile" : "/auth/login"} className="icon-btn" style={{ ...styles.iconButton, display: isMobile ? 'flex' : 'none' }}>
              <i className="fa-regular fa-user"></i>
            </Link>
          </div>

        </div>
      </header>

      {/* Mobile Search Row */}
      <div className="mobile-search-row" style={{ 
        position: 'fixed', 
        top: '64px', 
        left: 0, 
        width: '100%', 
        padding: '12px 20px', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        zIndex: 999,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxSizing: 'border-box'
      }}>
        <form onSubmit={handleSearch} className="search-input-wrap" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '12px', 
          padding: '10px 14px' 
        }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: '#64748b', fontSize: '14px' }}></i>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...styles.searchInput, paddingLeft: '10px', fontSize: '14px' }}
          />
        </form>
      </div>

      {/* Spacer */}
      <div className="header-spacer" style={{ height: isMobile ? '124px' : '80px' }}></div>

      {/* Side Drawer Overlay */}
      <div style={styles.drawerOverlay} onClick={() => setDrawerOpen(false)} />

      {/* Side Drawer */}
      <aside style={styles.drawer}>
        <div style={styles.drawerHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  backdropFilter: 'blur(4px)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                   <i className="fa-solid fa-user-astronaut" style={{ fontSize: '28px' }}></i>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.8, fontWeight: 500 }}>Welcome back,</p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>{resolvedSessionUser || 'Guest'}</p>
                </div>
             </div>
             <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', opacity: 0.8 }} className="icon-btn">
               <i className="fa-solid fa-circle-xmark"></i>
             </button>
          </div>
          {!resolvedSessionUser && (
            <Link href="/auth/login" onClick={() => setDrawerOpen(false)} style={{ 
              display: 'block', 
              width: '100%', 
              textAlign: 'center' as const, 
              backgroundColor: '#fff', 
              color: '#088178', 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              textDecoration: 'none', 
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} className="icon-btn">
              Login / Register
            </Link>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          <p style={{ padding: '0 24px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Navigation</p>
          <div className="drawer-item"><Link href="/" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'home')}><i className="fa-solid fa-house" style={{ width: '32px', fontSize: '18px' }}></i> Home</Link></div>
          <div className="drawer-item"><Link href="/shop" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'shop')}><i className="fa-solid fa-shop" style={{ width: '32px', fontSize: '18px' }}></i> Shop</Link></div>
          <div className="drawer-item"><Link href="/blog" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'blog')}><i className="fa-solid fa-clapperboard" style={{ width: '32px', fontSize: '18px' }}></i> Blog</Link></div>
          <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '20px 24px' }}></div>
          <p style={{ padding: '0 24px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Account</p>
          <div className="drawer-item"><Link href="/profile" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'profile')}><i className="fa-solid fa-fingerprint" style={{ width: '32px', fontSize: '18px' }}></i> My Profile</Link></div>
          <div className="drawer-item"><Link href="/wishlist" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'wishlist')}><i className="fa-regular fa-heart" style={{ width: '32px', fontSize: '18px' }}></i> My Wishlist</Link></div>
          <div className="drawer-item"><Link href="/cart" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(false)}><i className="fa-solid fa-basket-shopping" style={{ width: '32px', fontSize: '18px' }}></i> My Cart</Link></div>
          <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '20px 24px' }}></div>
          <div className="drawer-item"><Link href="/about" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'about')}><i className="fa-solid fa-circle-nodes" style={{ width: '32px', fontSize: '18px' }}></i> About Us</Link></div>
          <div className="drawer-item"><Link href="/contact" onClick={() => setDrawerOpen(false)} style={styles.drawerLink(activePage === 'contact')}><i className="fa-solid fa-headset" style={{ width: '32px', fontSize: '18px' }}></i> Help Center</Link></div>
        </div>

        {resolvedSessionUser && (
          <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <Link href="/auth/logout" onClick={() => setDrawerOpen(false)} style={{ color: '#ef4444', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px' }} className="icon-btn">
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
