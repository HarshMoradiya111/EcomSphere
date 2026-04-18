'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/config';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [resolvedSessionUser, setResolvedSessionUser] = useState<string | null>(sessionUser);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Initialize from URL params if available
  const initialSearch = searchParams.get('search') || search;
  const initialCat = searchParams.get('category') || 'All';
  
  const [desktopQuery, setDesktopQuery] = useState(initialSearch);
  const [mobileQuery, setMobileQuery] = useState(initialSearch);
  const [searchCategory, setSearchCategory] = useState(initialCat);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  const [desktopResults, setDesktopResults] = useState<SearchProduct[]>([]);
  const [mobileResults, setMobileResults] = useState<SearchProduct[]>([]);
  const [showDesktopResults, setShowDesktopResults] = useState(false);
  const [showMobileResults, setShowMobileResults] = useState(false);

  const logoSrc = resolveLogoSrc(settings?.logo);

  // Fetch categories for search scoping
  useEffect(() => {
    fetch(`${API_URL}/api/v1/products/categories/list`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAllCategories(data.categories);
      })
      .catch(() => {});
  }, []);

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
        const res = await fetch(`${API_URL}/api/v1/products?search=${encodeURIComponent(q)}&category=${searchCategory}&limit=5`);
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
  }, [desktopQuery, searchCategory]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = desktopQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (searchCategory !== 'All') params.set('category', searchCategory);
    
    router.push(`/shop?${params.toString()}`);
    setShowDesktopResults(false);
  };

  const desktopNoResults = useMemo(
    () => showDesktopResults && desktopQuery.trim().length >= 2 && desktopResults.length === 0,
    [showDesktopResults, desktopQuery, desktopResults.length]
  );

  return (
    <>
      <section id="header" style={{ padding: '15px 40px', backgroundColor: '#fff', boxShadow: '0 5px 15px rgba(0,0,0,0.06)', zIndex: 999 }}>
        <a href="/">
          <img src={logoSrc} className="logo" alt="EcomSphere" height={40} style={{ objectFit: 'contain' }} />
        </a>

        {/* --- Global Amazon-Style Search Bar --- */}
        <form onSubmit={handleGlobalSearch} id="search-bar-desktop" style={{ 
          display: 'flex', 
          flex: '1', 
          maxWidth: '650px', 
          margin: '0 30px', 
          position: 'relative',
          borderRadius: '4px',
          overflow: 'visible' 
        }}>
          <div style={{ display: 'flex', width: '100%', border: '2px solid #088178', borderRadius: '4px', overflow: 'hidden' }}>
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              style={{ 
                width: '130px', 
                padding: '0 10px', 
                border: 'none', 
                borderRight: '1px solid #ddd', 
                background: '#f3f3f3', 
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <input
              type="text"
              name="search"
              placeholder="Search for products, brands and more..."
              value={desktopQuery}
              autoComplete="off"
              onChange={(e) => setDesktopQuery(e.target.value)}
              onFocus={() => {
                if (desktopQuery.trim().length >= 2) setShowDesktopResults(true);
              }}
              style={{ 
                flex: '1', 
                padding: '10px 15px', 
                border: 'none', 
                fontSize: '14px',
                outline: 'none'
              }}
            />
            
            <button type="submit" style={{ 
              width: '50px', 
              background: '#088178', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          {/* Live Suggestions Dropdown */}
          <div id="search-results-desktop" className={`search-results-dropdown ${showDesktopResults ? 'show' : ''}`} style={{
             position: 'absolute',
             top: '100%',
             left: '0',
             right: '0',
             background: '#fff',
             boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
             zIndex: 1000,
             display: showDesktopResults ? 'block' : 'none',
             border: '1px solid #ddd',
             marginTop: '5px'
          }}>
            {desktopResults.map((p) => (
              <a key={p._id} href={`/product/${p._id}`} className="search-result-item" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee',
                textDecoration: 'none',
                color: '#333'
              }}>
                <img
                  src={`/uploads/${p.image}`}
                  alt={p.name}
                  style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '15px' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/img/placeholder.jpg';
                  }}
                />
                <div className="res-info">
                  <h5 style={{ margin: '0', fontSize: '14px' }}>{p.name}</h5>
                  <p style={{ margin: '0', fontSize: '12px', color: '#088178', fontWeight: '700' }}>{`₹${toCurrency(p.price)}`}</p>
                </div>
              </a>
            ))}
            {desktopNoResults && <div className="search-no-results" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>No results found</div>}
          </div>
        </form>

        <div id="nav-desktop">
          <ul style={{ display: 'flex', alignItems: 'center', gap: '25px', listStyle: 'none', margin: '0' }}>
            <li><a href="/" className={activePage === 'home' ? 'active' : ''} style={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: '600' }}>Home</a></li>
            <li><a href="/shop" className={activePage === 'shop' ? 'active' : ''} style={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: '600' }}>Shop</a></li>
            {resolvedSessionUser ? (
              <>
                <li style={{ position: 'relative' }}>
                  <a href="/profile" style={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: '600' }}>
                     <i className="fa-solid fa-user" style={{ marginRight: '5px' }}></i>
                     {resolvedSessionUser.split(' ')[0]}
                  </a>
                </li>
              </>
            ) : (
              <li><a href="/auth/login" style={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: '600' }}>Login</a></li>
            )}
            <li id="lg-bag" style={{ position: 'relative' }}>
              <a href="/cart" style={{ textDecoration: 'none' }}>
                <i className="fa-solid fa-cart-shopping" style={{ fontSize: '20px', color: '#1a1a1a' }}></i>
              </a>
            </li>
          </ul>
        </div>

        <div id="mobile">
          <a href="/cart" aria-label="Cart"><img src="/img/cart.svg" height={20} alt="Cart" /></a>
          <button id="bar" onClick={() => setDrawerOpen(true)}>
             <i className="fa-solid fa-bars" style={{ fontSize: '24px' }}></i>
          </button>
        </div>
      </section>

      {/* Overlay for closing dropdown when clicking outside */}
      {showDesktopResults && <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', zIndex: 998 }} onClick={() => setShowDesktopResults(false)}></div>}
    </>
  );
}
