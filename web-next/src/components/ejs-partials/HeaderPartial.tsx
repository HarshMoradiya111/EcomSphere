'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/src/config';
import type { HeaderPartialProps, SearchProduct } from './types';

function toCurrency(price: number) {
  return Number(price || 0).toLocaleString('en-IN');
}

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
  search = '',
  activePage,
  sessionUser = null,
  sessionPhoto = null,
  showAdminLink = true,
}: HeaderPartialProps) {
  const [resolvedSessionUser, setResolvedSessionUser] = useState<string | null>(sessionUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [desktopQuery, setDesktopQuery] = useState(search);
  const [mobileQuery, setMobileQuery] = useState(search);
  const [desktopResults, setDesktopResults] = useState<SearchProduct[]>([]);
  const [mobileResults, setMobileResults] = useState<SearchProduct[]>([]);
  const [showDesktopResults, setShowDesktopResults] = useState(false);
  const [showMobileResults, setShowMobileResults] = useState(false);

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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;

    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, scrollY);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };

    const onResize = () => {
      if (window.innerWidth > 1100 && drawerOpen) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [drawerOpen]);

  useEffect(() => {
    const fetchResults = async (
      query: string,
      setItems: (items: SearchProduct[]) => void,
      setVisible: (visible: boolean) => void
    ) => {
      const q = query.trim();
      if (q.length < 2) {
        setItems([]);
        setVisible(false);
        return;
      }

      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();

        if (data?.success) {
          setItems(data.products || []);
          setVisible(true);
        }
      } catch {
        setItems([]);
        setVisible(false);
      }
    };

    const t1 = setTimeout(() => {
      void fetchResults(desktopQuery, setDesktopResults, setShowDesktopResults);
    }, 300);

    return () => clearTimeout(t1);
  }, [desktopQuery]);

  useEffect(() => {
    const fetchResults = async (
      query: string,
      setItems: (items: SearchProduct[]) => void,
      setVisible: (visible: boolean) => void
    ) => {
      const q = query.trim();
      if (q.length < 2) {
        setItems([]);
        setVisible(false);
        return;
      }

      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();

        if (data?.success) {
          setItems(data.products || []);
          setVisible(true);
        }
      } catch {
        setItems([]);
        setVisible(false);
      }
    };

    const t2 = setTimeout(() => {
      void fetchResults(mobileQuery, setMobileResults, setShowMobileResults);
    }, 300);

    return () => clearTimeout(t2);
  }, [mobileQuery]);

  const desktopNoResults = useMemo(
    () => showDesktopResults && desktopQuery.trim().length >= 2 && desktopResults.length === 0,
    [showDesktopResults, desktopQuery, desktopResults.length]
  );

  const mobileNoResults = useMemo(
    () => showMobileResults && mobileQuery.trim().length >= 2 && mobileResults.length === 0,
    [showMobileResults, mobileQuery, mobileResults.length]
  );

  return (
    <>
      <section id="header">
        <a href="/">
          <img src={logoSrc} className="logo" alt="EcomSphere" height={45} />
        </a>

        <form action="/shop" method="GET" id="search-bar-desktop" style={{ position: 'relative' }}>
          <input
            type="text"
            name="search"
            id="live-search-input-desktop"
            placeholder="Search products..."
            value={desktopQuery}
            autoComplete="off"
            onChange={(e) => setDesktopQuery(e.target.value)}
            onFocus={() => {
              if (desktopQuery.trim().length >= 2) setShowDesktopResults(true);
            }}
          />
          <button type="submit">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          <div id="search-results-desktop" className={`search-results-dropdown ${showDesktopResults ? 'show' : ''}`}>
            {desktopResults.map((p) => (
              <a key={p._id} href={`/product/${p._id}`} className="search-result-item">
                <img
                  src={`/uploads/${p.image}`}
                  alt={p.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/img/placeholder.jpg';
                  }}
                />
                <div className="res-info">
                  <h5>{p.name}</h5>
                  <p>{`₹${toCurrency(p.price)}`}</p>
                </div>
              </a>
            ))}
            {desktopNoResults && <div className="search-no-results">No products found for "{desktopQuery.trim()}"</div>}
          </div>
        </form>

        <div id="nav-desktop">
          <ul>
            <li><a href="/" className={activePage === 'home' ? 'active' : ''}>Home</a></li>
            <li><a href="/shop" className={activePage === 'shop' ? 'active' : ''}>Shop</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/about" className={activePage === 'about' ? 'active' : ''}>About</a></li>
            <li><a href="/contact" className={activePage === 'contact' ? 'active' : ''}>Contact</a></li>
            {resolvedSessionUser ? (
              <>
                <li><a href="/profile">Profile</a></li>
                <li><a href="/wishlist" className={activePage === 'wishlist' ? 'active' : ''}><i className="fa-regular fa-heart"></i></a></li>
                <li><a href="/auth/logout">Logout ({resolvedSessionUser})</a></li>
              </>
            ) : (
              <li><a href="/auth/login">Login</a></li>
            )}
            {showAdminLink && <li><a href="/admin/dashboard">Admin</a></li>}
            <li id="lg-bag"><a href="/cart"><img src="/img/cart.png" className="cart" alt="Cart" height={30} /></a></li>
          </ul>
        </div>

        <div id="mobile">
          <a href="/cart" aria-label="Cart"><img src="/img/cart.svg" height={20} alt="Cart" /></a>
          <button
            id="bar"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen(true);
            }}
          >
            <img src="/img/menu.svg" height={20} width={30} alt="Menu" />
          </button>
        </div>
      </section>

      <nav id="navbar" role="dialog" aria-modal="true" aria-label="Mobile Navigation" className={drawerOpen ? 'active' : ''}>
        <div id="drawer-profile">
          <div id="drawer-profile-icon">
            {sessionPhoto ? (
              <img src={sessionPhoto} alt="User" className="drawer-avatar" />
            ) : (
              <i className="fa-solid fa-circle-user"></i>
            )}
          </div>
          <div id="drawer-profile-text">
            {resolvedSessionUser ? (
              <>
                <span className="drawer-hello">Hello,</span>
                <strong>{resolvedSessionUser}</strong>
              </>
            ) : (
              <>
                <span className="drawer-hello">Hello,</span>
                <a href="/auth/login"><strong>Sign In</strong></a>
              </>
            )}
          </div>
          <a
            href="#"
            id="close"
            aria-label="Close menu"
            onClick={(e) => {
              e.preventDefault();
              setDrawerOpen(false);
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </a>
        </div>

        <ul>
          <li style={{ padding: '10px 25px' }}>
            <form action="/shop" method="GET" id="search-bar-mobile" style={{ position: 'relative' }}>
              <input
                type="text"
                name="search"
                id="live-search-input-mobile"
                placeholder="Search..."
                value={mobileQuery}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                autoComplete="off"
                onChange={(e) => setMobileQuery(e.target.value)}
                onFocus={() => {
                  if (mobileQuery.trim().length >= 2) setShowMobileResults(true);
                }}
              />
              <div id="search-results-mobile" className={`search-results-dropdown ${showMobileResults ? 'show' : ''}`}>
                {mobileResults.map((p) => (
                  <a key={p._id} href={`/product/${p._id}`} className="search-result-item">
                    <img
                      src={`/uploads/${p.image}`}
                      alt={p.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/img/placeholder.jpg';
                      }}
                    />
                    <div className="res-info">
                      <h5>{p.name}</h5>
                      <p>{`₹${toCurrency(p.price)}`}</p>
                    </div>
                  </a>
                ))}
                {mobileNoResults && <div className="search-no-results">No products found for "{mobileQuery.trim()}"</div>}
              </div>
            </form>
          </li>
          <li className="drawer-section-label">Browse</li>
          <li><a href="/" className={activePage === 'home' ? 'active' : ''} data-track="sidebar_click" data-label="home"><i className="fa-solid fa-house"></i> Home</a></li>
          <li><a href="/shop" className={activePage === 'shop' ? 'active' : ''} data-track="sidebar_click" data-label="shop"><i className="fa-solid fa-bag-shopping"></i> Shop</a></li>
          <li><a href="/blog" data-track="sidebar_click" data-label="blog"><i className="fa-solid fa-newspaper"></i> Blog</a></li>

          <li className="drawer-section-label">Discover</li>
          <li><a href="/about" className={activePage === 'about' ? 'active' : ''} data-track="sidebar_click" data-label="about"><i className="fa-solid fa-circle-info"></i> About Us</a></li>
          <li><a href="/contact" className={activePage === 'contact' ? 'active' : ''} data-track="sidebar_click" data-label="contact"><i className="fa-solid fa-headset"></i> Contact Us</a></li>

          <li className="drawer-section-label">My Account</li>
          <li><a href="/profile" data-track="sidebar_click" data-label="profile"><i className="fa-solid fa-user"></i> My Profile</a></li>
          <li><a href="/cart" data-track="sidebar_click" data-label="cart"><i className="fa-solid fa-cart-shopping"></i> My Cart</a></li>

          <li className="drawer-section-label">Settings</li>
          {showAdminLink && <li><a href="/admin/dashboard" data-track="sidebar_click" data-label="admin"><i className="fa-solid fa-screwdriver-wrench"></i> Admin Dashboard</a></li>}
          {resolvedSessionUser ? (
            <li><a href="/auth/logout" data-track="sidebar_click" data-label="logout"><i className="fa-solid fa-arrow-right-from-bracket"></i> Logout</a></li>
          ) : (
            <li><a href="/auth/login" data-track="sidebar_click" data-label="login"><i className="fa-solid fa-right-to-bracket"></i> Login / Register</a></li>
          )}
        </ul>
      </nav>

      <div id="drawer-overlay" className={drawerOpen ? 'visible' : ''} onClick={() => setDrawerOpen(false)}></div>
    </>
  );
}
