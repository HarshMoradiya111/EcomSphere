'use client';

import { useEffect, useState } from 'react';
import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import ProductList from '@/features/shop/ProductList';
import Link from 'next/link';

type MarketingAssets = {
  banners?: Array<{ image: string; subtitle?: string; title?: string; buttonLink?: string; buttonText?: string }>;
  flashSale?: { isActive?: boolean; title?: string; discountText?: string } | null;
};

interface HomePageClientProps {
  marketing: MarketingAssets;
  sessionUser: string | null;
  settings: any;
}

export default function HomePageClient({ marketing, sessionUser, settings }: HomePageClientProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const banner = marketing?.banners?.[0];

  // --- Inline Styles ---
  const s = {
    hero: (bgImg?: string) => ({
      height: '90vh',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      backgroundImage: `url(${bgImg || '/img/hero4.png'})`,
      backgroundColor: '#e3e6f3',
      backgroundSize: 'cover',
      backgroundPosition: isMobile ? 'center' : 'top 25% right 0',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      padding: isMobile ? '0 24px' : '0 80px',
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      overflow: 'hidden',
    }),
    heroOverlay: {
      position: 'absolute' as const,
      inset: 0,
      background: isMobile
        ? 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 100%)'
        : 'linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 40%, transparent 70%)',
      zIndex: 0,
    },
    heroContent: {
      position: 'relative' as const,
      zIndex: 1,
      maxWidth: '520px',
    },
    heroEyebrow: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      fontWeight: 800,
      color: '#088178',
      background: '#e8f8f7',
      padding: '6px 14px',
      borderRadius: '9999px',
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      marginBottom: '16px',
      border: '1px solid rgba(8,129,120,0.2)',
    },
    heroH2: {
      fontSize: isMobile ? '32px' : '48px',
      fontWeight: 900,
      color: isMobile ? '#ffffff' : '#1a1a2e',
      margin: '0 0 4px 0',
      lineHeight: 1.1,
      letterSpacing: '-1px',
    },
    heroH1: {
      fontSize: isMobile ? '36px' : '56px',
      fontWeight: 900,
      color: '#088178',
      margin: '0 0 18px 0',
      lineHeight: 1.05,
      letterSpacing: '-1.5px',
    },
    heroP: {
      fontSize: isMobile ? '14px' : '16px',
      color: isMobile ? 'rgba(255,255,255,0.9)' : '#718096',
      marginBottom: '32px',
      maxWidth: '440px',
      lineHeight: 1.7,
      fontWeight: 400,
    },
    heroBtn: {
      backgroundColor: '#088178',
      color: '#fff',
      padding: '16px 36px',
      borderRadius: '9999px',
      border: 'none',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(8, 129, 120, 0.30)',
      width: 'fit-content',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      letterSpacing: '0.3px',
    },

    featureContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      padding: isMobile ? '40px 20px' : '52px 80px',
      gap: '16px',
      background: '#ffffff',
    },
    featureBox: {
      width: isMobile ? 'calc(50% - 8px)' : '160px',
      textAlign: 'center' as const,
      padding: '28px 16px',
      border: '1px solid #edf2f7',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      boxSizing: 'border-box' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      cursor: 'default',
    },
    featureImg: { width: '72px', height: '72px', objectFit: 'contain' as const, marginBottom: '14px' },
    featureLabel: {
      fontSize: '11px',
      fontWeight: 700,
      color: '#2d3436',
      padding: '6px 12px',
      borderRadius: '9999px',
      whiteSpace: 'nowrap' as const,
      letterSpacing: '0.5px',
    },

    sectionHeader: {
      textAlign: 'center' as const,
      padding: isMobile ? '48px 20px 24px' : '72px 80px 28px 80px',
    },
    sectionEyebrow: {
      fontSize: '11px',
      fontWeight: 800,
      color: '#088178',
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      display: 'block',
      marginBottom: '12px',
    },
    sectionH2: {
      fontSize: isMobile ? '30px' : '44px',
      fontWeight: 900,
      color: '#1a1a2e',
      margin: '0 0 10px 0',
      letterSpacing: '-0.5px',
    },
    sectionP: {
      color: '#718096',
      fontSize: '15px',
      margin: 0,
      paddingBottom: '8px',
      fontWeight: 400,
    },
    sectionDivider: {
      width: '48px',
      height: '3px',
      background: 'linear-gradient(90deg, #088178, #06a899)',
      borderRadius: '9999px',
      margin: '16px auto 0',
    },

    productSection: { padding: isMobile ? '0 20px 48px' : '0 80px 56px' },

    bannerRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' as const : 'row' as const,
      gap: '20px',
      padding: isMobile ? '0 20px 48px' : '0 80px 56px',
      boxSizing: 'border-box' as const,
    },
    bannerBox: {
      flex: 1,
      height: isMobile ? '220px' : '320px',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      padding: '0 36px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    },
    bannerImg: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      zIndex: -1,
      transition: 'transform 0.6s ease',
    },
    bannerOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to right, rgba(0,0,0,0.72), rgba(0,0,0,0.1))',
      zIndex: 0,
    },
    bannerContent: {
      position: 'relative' as const,
      zIndex: 1,
      color: '#ffffff',
    },

    flashBanner: {
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      height: '300px',
      position: 'relative' as const,
      backgroundColor: '#041e42',
      overflow: 'hidden',
    },
    flashImg: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      opacity: 0.4,
      zIndex: 0,
    },
    flashOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(4,30,66,0.88) 0%, rgba(8,129,120,0.5) 100%)',
      zIndex: 1,
    },
    flashContent: {
      position: 'relative' as const,
      zIndex: 10,
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      color: '#ffffff',
      padding: '0 20px',
    },

    newsletter: {
      background: 'linear-gradient(135deg, #041e42 0%, #0a3054 50%, #088178 100%)',
      padding: isMobile ? '48px 24px' : '64px 80px',
      display: 'flex',
      flexDirection: isMobile ? 'column' as const : 'row' as const,
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '28px',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      overflow: 'hidden',
    },
    newsInput: {
      padding: '16px 22px',
      borderRadius: '9999px 0 0 9999px',
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      flex: 1,
      minWidth: isMobile ? '100%' : '300px',
      boxSizing: 'border-box' as const,
      fontFamily: '"Poppins", sans-serif',
      background: 'rgba(255,255,255,0.95)',
      color: '#2d3436',
    },
    newsBtn: {
      backgroundColor: '#088178',
      color: '#ffffff',
      padding: '16px 28px',
      borderRadius: isMobile ? '9999px' : '0 9999px 9999px 0',
      border: 'none',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      marginTop: isMobile ? '8px' : '0',
      width: isMobile ? '100%' : 'auto',
      boxShadow: '0 4px 15px rgba(8,129,120,0.3)',
      letterSpacing: '0.3px',
      fontFamily: '"Poppins", sans-serif',
    },
  };

  return (
    <StorefrontShell
      header={{ activePage: 'home', sessionUser }}
      settings={settings}
      sessionUser={sessionUser}
      success={[]}
      errors={[]}
    >
      {/* 1. HERO SECTION */}
      <section style={s.hero(banner ? `/uploads/${banner.image}` : undefined)}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent} className="fade-in-up">
          <div style={s.heroEyebrow}>
            <i className="fa-solid fa-bolt" style={{ fontSize: '9px' }} />
            {banner?.subtitle || 'Trade-in-offer'}
          </div>
          <h2 style={s.heroH2}>{banner?.title || 'Super value deals'}</h2>
          <h1 style={s.heroH1}>On all products</h1>
          <p style={s.heroP}>Save more with coupons &amp; enjoy up to <strong style={{ color: '#088178', fontWeight: 800 }}>70% off!</strong></p>
          <Link href={banner?.buttonLink || '/shop'}>
            <button style={s.heroBtn}>
              {banner?.buttonText || 'Shop Now'}
              <i className="fa-solid fa-arrow-right" style={{ fontSize: '13px' }} />
            </button>
          </Link>
        </div>
      </section>

      {/* 2. FEATURE BOXES */}
      <section style={s.featureContainer}>
        {[
          { id: 'f1', label: 'Free Shipping', color: '#fff0f3', icon: '🚚' },
          { id: 'f2', label: 'Online Order', color: '#f0fdf4', icon: '📦' },
          { id: 'f3', label: 'Save Money', color: '#eff6ff', icon: '💰' },
          { id: 'f4', label: 'Promotions', color: '#faf5ff', icon: '🎁' },
          { id: 'f5', label: 'Happy Sell', color: '#fff5f7', icon: '😊' },
          { id: 'f6', label: '24/7 Support', color: '#fffbeb', icon: '🎧' },
        ].map((item) => (
          <div key={item.id} style={s.featureBox} className="hover-lift">
            <img src={`/img/features/${item.id}.jpg`} alt={item.label} style={s.featureImg} />
            <h6 style={{ ...s.featureLabel, background: item.color }}>{item.label}</h6>
          </div>
        ))}
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <div style={s.sectionHeader}>
        <span style={s.sectionEyebrow}>Hand-picked for you</span>
        <h2 style={s.sectionH2}>Featured Products</h2>
        <p style={s.sectionP}>Summer Collection · New Modern Design</p>
        <div style={s.sectionDivider} />
      </div>
      <section style={s.productSection}>
        <ProductList />
      </section>

      {/* 4. DUAL BANNERS */}
      <section style={s.bannerRow}>
        <div style={s.bannerBox}>
          <img src="/img/banner/b17.jpg" alt="Deals" style={s.bannerImg} />
          <div style={s.bannerOverlay} />
          <div style={s.bannerContent}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '2px',
                opacity: 0.8,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              crazy deals
            </span>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: 900, lineHeight: 1.2 }}>
              Buy 1 Get 1 <span style={{ color: '#ff4757' }}>Free</span>
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', opacity: 0.85, lineHeight: 1.5, color: '#fff', maxWidth: '260px' }}>
              The best classic dress is on sale at EcomSphere
            </p>
            <Link href="/shop">
              <button
                className="white"
                style={{
                  borderRadius: '9999px',
                  padding: '10px 28px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                }}
              >
                Learn More →
              </button>
            </Link>
          </div>
        </div>
        <div style={s.bannerBox}>
          <img src="/img/banner/b10.jpg" alt="Sale" style={s.bannerImg} />
          <div style={{ ...s.bannerOverlay, background: 'linear-gradient(to right, rgba(8, 129, 120, 0.8), rgba(8,129,120,0.1))' }} />
          <div style={s.bannerContent}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '2px',
                opacity: 0.8,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              upcoming season
            </span>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: 900, lineHeight: 1.2 }}>
              Flash Sale <span style={{ color: '#ffd700' }}>🔥</span>
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', opacity: 0.85, lineHeight: 1.5, color: '#fff', maxWidth: '260px' }}>
              Up to 70% off on premium collections
            </p>
            <Link href="/shop">
              <button
                className="white"
                style={{
                  borderRadius: '9999px',
                  padding: '10px 28px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                }}
              >
                Explore Now →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FLASH SALE BANNER */}
      <section style={s.flashBanner}>
        <img src="/img/banner/b2.jpg" alt="Flash Sale" style={s.flashImg} />
        <div style={s.flashOverlay} />
        <div style={s.flashContent}>
          {marketing?.flashSale?.isActive ? (
            <>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '2.5px',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '12px',
                  display: 'block',
                }}
              >
                Limited Time Only
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#ffd700' }}>
                {marketing.flashSale.title || 'Flash Sale'}
              </h4>
              <h2 style={{ margin: '0 0 28px 0', fontSize: '36px', fontWeight: 900 }}>
                {marketing.flashSale.discountText || 'Limited Time Offers'}
              </h2>
              <Link href="/shop">
                <button
                  style={{
                    backgroundColor: '#fff',
                    color: '#088178',
                    padding: '15px 48px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    letterSpacing: '0.3px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Shop Now
                </button>
              </Link>
            </>
          ) : (
            <>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '2.5px',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '12px',
                  display: 'block',
                }}
              >
                Special Offer
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#ffd700' }}>
                Repair Services
              </h4>
              <h2 style={{ margin: '0 0 28px 0', fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>
                Up to <span style={{ color: '#ff4757' }}>70%</span> Off — All Accessories
              </h2>
              <Link href="/shop">
                <button
                  style={{
                    backgroundColor: '#fff',
                    color: '#088178',
                    padding: '15px 48px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    letterSpacing: '0.3px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Explore More
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 6. NEWSLETTER */}
      <section style={s.newsletter}>
        {/* Decorative orb */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '10%',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ color: '#fff', position: 'relative', zIndex: 1 }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase' as const,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.6)',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Stay in the loop
          </span>
          <h4 style={{ margin: '0 0 8px 0', fontSize: isMobile ? '22px' : '28px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Sign Up For Newsletters
          </h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Get e-mail updates about our latest shop and{' '}
            <span style={{ color: '#ff4757', fontWeight: 700 }}>special offers.</span>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', position: 'relative', zIndex: 1 } as any}>
          <input type="email" placeholder="Your email address" style={s.newsInput} />
          <button style={s.newsBtn}>Subscribe</button>
        </div>
      </section>
    </StorefrontShell>
  );
}
