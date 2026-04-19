'use client';

import { useEffect, useMemo, useState } from 'react';
import SafeImage from '@/components/SafeImage';
import { getProductImageFallbackSrc, getProductImageSrc } from '@/utils/imagePaths';

const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'] as const;

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  averageRating?: number;
  numReviews?: number;
  createdAt?: string;
};

type ShopPageClientProps = {
  sessionUser?: string | null;
  wishlistIds?: string[];
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
};

function toNumber(value: string | undefined, fallback: number): number {
  if (!value || !value.trim()) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function flattenProducts(payload: any): Product[] {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (payload?.grouped && typeof payload.grouped === 'object') {
    return Object.values(payload.grouped).flatMap((items: any) => (Array.isArray(items) ? items : []));
  }

  return [];
}

export default function ShopPageClient({
  sessionUser = null,
  wishlistIds = [],
  category = '',
  search = '',
  minPrice = '',
  maxPrice = '',
  sortBy = 'newest',
}: ShopPageClientProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch('/api/v1/products', { cache: 'no-store' });
        if (!response.ok) {
          if (!cancelled) setAllProducts([]);
          return;
        }

        const json = await response.json();
        if (!cancelled) {
          setAllProducts(flattenProducts(json));
        }
      } catch {
        if (!cancelled) {
          setAllProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const wishlistIdSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const selectedCategory = CATEGORIES.includes(category as (typeof CATEGORIES)[number]) ? category : '';
  const normalizedSearch = search.trim();
  const normalizedSortBy = ['newest', 'oldest', 'price-low', 'price-high'].includes(sortBy) ? sortBy : 'newest';

  const allPrices = allProducts.map((product) => Number(product.price)).filter((price) => Number.isFinite(price));
  const minPossible = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPossible = allPrices.length > 0 ? Math.max(...allPrices) : 10000;
  const resolvedMinPrice = Math.max(minPossible, toNumber(minPrice, minPossible));
  const resolvedMaxPrice = Math.min(maxPossible, toNumber(maxPrice, maxPossible));

  const products = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }

      if (normalizedSearch) {
        const needle = normalizedSearch.toLowerCase();
        const searchable = `${product.name || ''} ${product.description || ''}`.toLowerCase();
        if (!searchable.includes(needle)) {
          return false;
        }
      }

      const price = Number(product.price) || 0;
      if (price < resolvedMinPrice || price > resolvedMaxPrice) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (normalizedSortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (normalizedSortBy === 'price-high') return Number(b.price) - Number(a.price);

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (normalizedSortBy === 'oldest') return dateA - dateB;
      return dateB - dateA;
    });
  }, [allProducts, normalizedSearch, normalizedSortBy, resolvedMaxPrice, resolvedMinPrice, selectedCategory]);

  if (loading) {
    return (
      <section className="section-p1" style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid #e8f8f7',
              borderTopColor: '#088178',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#088178', fontSize: '12px' }}>
            Loading products...
          </span>
        </div>
      </section>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Filter pills ── */
        .filter-btn {
          padding: 9px 20px;
          border-radius: 9999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: #ffffff;
          color: #718096;
          border: 1.5px solid #edf2f7;
          display: inline-block;
          letter-spacing: 0.2px;
        }
        .filter-btn.active, .filter-btn:hover {
          background: #088178;
          color: #fff;
          border-color: #088178;
          box-shadow: 0 4px 14px rgba(8,129,120,0.25);
          transform: translateY(-1px);
        }

        /* ── Filter form ── */
        .shop-filter-form input[type="range"] {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 9999px;
          background: linear-gradient(to right, #088178 0%, #088178 var(--range-pct,100%), #edf2f7 var(--range-pct,100%));
          cursor: pointer; outline: none;
        }
        .shop-filter-form input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #088178; cursor: pointer;
          box-shadow: 0 2px 8px rgba(8,129,120,0.3);
          border: 2px solid #fff; transition: all 0.2s ease;
        }
        .shop-filter-form input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .shop-filter-form select:focus, .shop-filter-form input[type="text"]:focus {
          border-color: #088178 !important;
          box-shadow: 0 0 0 3px rgba(8,129,120,0.12) !important;
          outline: none;
        }

        /* ── Premium Product Card ── */
        .sp-card {
          font-family: "Poppins", -apple-system, sans-serif;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f0f4f8;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
          cursor: pointer;
        }
        .sp-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(8,129,120,0.14);
        }
        .sp-img-wrap {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg,#f0f9f8 0%,#f7fffe 100%);
          height: 220px;
        }
        .sp-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .sp-card:hover .sp-img-wrap img { transform: scale(1.07); }
        .sp-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top,rgba(0,0,0,0.58) 0%,rgba(0,0,0,0.06) 55%,transparent 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 14px; gap: 8px;
        }
        .sp-card:hover .sp-overlay { opacity: 1; }
        .sp-qa-btn {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(6px);
          border: none; border-radius: 50px;
          padding: 8px 16px; font-size: 11px; font-weight: 700;
          color: #088178; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          transform: translateY(10px); opacity: 0;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap; letter-spacing: 0.2px;
        }
        .sp-card:hover .sp-qa-btn { opacity: 1; transform: translateY(0); }
        .sp-card:hover .sp-qa-btn:nth-child(2) { transition-delay: 0.04s; }
        .sp-card:hover .sp-qa-btn:nth-child(3) { transition-delay: 0.08s; }
        .sp-qa-btn:hover { background: #088178; color: #fff; }
        .sp-qa-btn.wishlisted { background: #fff0f2; color: #ff4757; }
        .sp-badge {
          font-family: "Poppins", sans-serif;
          position: absolute; top: 12px; left: 12px;
          background: linear-gradient(135deg,#088178 0%,#06a899 100%);
          color: #fff; font-size: 9px; font-weight: 800;
          letter-spacing: 1.4px; text-transform: uppercase;
          padding: 5px 12px; border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(8,129,120,0.35);
        }
        .sp-content {
          font-family: "Poppins", sans-serif;
          padding: 14px 16px 16px;
          display: flex; flex-direction: column; flex: 1; gap: 5px;
        }
        .sp-name {
          font-family: "Poppins", sans-serif;
          font-size: 13.5px; font-weight: 700; color: #1a1a2e;
          text-decoration: none; line-height: 1.4;
          letter-spacing: -0.1px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          transition: color 0.2s ease;
        }
        .sp-name:hover { color: #088178; }
        .sp-stars { display: flex; align-items: center; gap: 2px; }
        .sp-star { font-size: 10px; }
        .sp-star.on { color: #f0a500; }
        .sp-star.off { color: #dde3eb; }
        .sp-rev {
          font-family: "Poppins", sans-serif;
          font-size: 10px; color: #a0aec0; font-weight: 600;
          letter-spacing: 0.2px; margin-left: 3px;
        }
        .sp-price-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: auto; padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }
        .sp-price {
          font-family: "Poppins", sans-serif;
          font-size: 19px; font-weight: 800; color: #088178;
          letter-spacing: -0.6px; line-height: 1;
        }
        .sp-view-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg,#e8f8f7 0%,#f0fffe 100%);
          border: 1.5px solid rgba(8,129,120,0.2);
          color: #088178;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; font-size: 12px;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sp-view-btn:hover { background: #088178; color: #fff; border-color: #088178; transform: scale(1.12); }
      ` }} />

      {/* CATEGORY FILTER PILLS */}
      <section className="section-p1" style={{ paddingBottom: '10px', paddingTop: '32px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/shop" className={`filter-btn ${!selectedCategory ? 'active' : ''}`}>
            <i className="fa-solid fa-grip" style={{ marginRight: '6px', fontSize: '11px' }} />
            All Products
          </a>
          {CATEGORIES.map((item) => (
            <a
              key={item}
              href={`/shop?category=${encodeURIComponent(item)}`}
              className={`filter-btn ${selectedCategory === item ? 'active' : ''}`}
            >
              {item}
            </a>
          ))}
        </div>
      </section>

      {/* FILTER FORM */}
      <section className="section-p1" style={{ paddingTop: '16px' }}>
        <form
          action="/shop"
          method="GET"
          id="filter-form"
          className="shop-filter-form"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            background: '#ffffff',
            padding: '28px 32px',
            borderRadius: '16px',
            border: '1px solid #edf2f7',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <input type="hidden" name="category" value={selectedCategory} />

          {/* Search */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '10px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Search Keyword
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#c8d6e5', fontSize: '13px' }} />
              <input
                type="text"
                name="search"
                defaultValue={normalizedSearch}
                placeholder="Try 'Summer dress'..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1.5px solid #edf2f7',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Poppins", sans-serif',
                  color: '#2d3436',
                  background: '#f7f8fc',
                }}
              />
            </div>
          </div>

          {/* Price Range */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '10px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Price Limit:&nbsp;
              <span style={{ color: '#088178', fontWeight: 900 }}>
                ₹{Math.round(resolvedMaxPrice).toLocaleString('en-IN')}
              </span>
            </label>
            <div style={{ padding: '6px 0' }}>
              <input
                type="range"
                name="maxPrice"
                min={Math.round(minPossible)}
                max={Math.round(maxPossible)}
                defaultValue={Math.round(resolvedMaxPrice)}
                step={100}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#a0aec0', marginTop: '8px', fontWeight: 600 }}>
                <span>₹{Math.round(minPossible).toLocaleString('en-IN')}</span>
                <span>₹{Math.round(maxPossible).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input type="hidden" name="minPrice" value={Math.round(resolvedMinPrice)} />
          </div>

          {/* Sort */}
          <div style={{ width: '220px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '10px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Sort Results
            </label>
            <select
              name="sortBy"
              defaultValue={normalizedSortBy}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #edf2f7',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: '"Poppins", sans-serif',
                color: '#2d3436',
                background: '#f7f8fc',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Submit */}
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="submit"
              style={{
                padding: '13px 32px',
                borderRadius: '10px',
                fontSize: '14px',
                height: '46px',
                background: '#088178',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: '"Poppins", sans-serif',
                boxShadow: '0 4px 14px rgba(8,129,120,0.25)',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.2px',
              }}
            >
              <i className="fa-solid fa-sliders" style={{ fontSize: '13px' }} />
              Apply Filters
            </button>
          </div>
        </form>
      </section>

      {/* PRODUCT GRID */}
      <section id="product1" className="section-p1">
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          {normalizedSearch ? (
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
              Results for &ldquo;{normalizedSearch}&rdquo;
            </h2>
          ) : (
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
              {selectedCategory || 'All Products'}
            </h2>
          )}
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#088178',
              background: '#e8f8f7',
              padding: '4px 12px',
              borderRadius: '9999px',
              border: '1px solid rgba(8,129,120,0.2)',
            }}
          >
            {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '22px',
            paddingTop: '8px',
          }}
        >
          {products.length > 0 ? (
            products.map((product) => {
              const avg = Math.round(product.averageRating || 0);
              const isWishlisted = wishlistIdSet.has(product._id);
              return (
                <div className="sp-card" key={product._id}>
                  {/* Image area */}
                  <div className="sp-img-wrap">
                    <a href={`/product/${product._id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                      <SafeImage
                        src={getProductImageSrc(product.image)}
                        fallbackSrc={getProductImageFallbackSrc(product.image)}
                        alt={product.name}
                      />
                    </a>

                    {/* Category badge */}
                    <span className="sp-badge">{product.category}</span>

                    {/* Hover quick-action overlay */}
                    <div className="sp-overlay">
                      <a
                        href="#"
                        className={`sp-qa-btn add-to-cart cart1 ${isWishlisted ? 'wishlisted' : ''}`}
                        data-product-id={product._id}
                        data-name={product.name}
                        data-price={product.price}
                        data-image={product.image}
                        title="Add to Cart"
                      >
                        <i className="fa-solid fa-bag-shopping" style={{ fontSize: '10px' }} />
                        Add to Cart
                      </a>
                      <a
                        href={sessionUser ? '#' : '/auth/login'}
                        className={`sp-qa-btn toggle-wishlist ${isWishlisted ? 'wishlisted active' : ''}`}
                        data-product-id={product._id}
                        title={sessionUser ? 'Wishlist' : 'Login to wishlist'}
                      >
                        <i className={`fa-${isWishlisted ? 'solid' : 'regular'} fa-heart`} style={{ fontSize: '10px' }} />
                        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                      </a>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="sp-content">
                    {/* Stars */}
                    <div className="sp-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={`${product._id}-s${i}`}
                          className={`fa-solid fa-star sp-star ${i < avg ? 'on' : 'off'}`}
                        />
                      ))}
                      <span className="sp-rev">({product.numReviews || 0})</span>
                    </div>

                    {/* Name */}
                    <a href={`/product/${product._id}`} className="sp-name">
                      {product.name}
                    </a>

                    {/* Description snippet */}
                    {product.description && (
                      <p style={{
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '11px',
                        fontWeight: 400,
                        color: '#b0bec5',
                        margin: 0,
                        lineHeight: 1.5,
                        letterSpacing: '0.1px',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: 'hidden',
                      }}>
                        {product.description}
                      </p>
                    )}

                    {/* Price row */}
                    <div className="sp-price-row">
                      <span className="sp-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                      <a href={`/product/${product._id}`} className="sp-view-btn" title="View Details">
                        <i className="fa-solid fa-arrow-right" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '80px 20px', gridColumn: '1 / -1' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#f7f8fc',
                  border: '1px solid #edf2f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '28px', color: '#c8d6e5' }} />
              </div>
              <h4 style={{ color: '#1a1a2e', fontWeight: 700, marginBottom: '8px' }}>No products found</h4>
              <p style={{ color: '#a0aec0', fontSize: '14px', marginBottom: '24px' }}>
                Try adjusting your filters or browsing all categories.
              </p>
              <a
                href="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 32px',
                  background: '#088178',
                  color: '#fff',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: '0 4px 14px rgba(8,129,120,0.25)',
                  transition: 'all 0.25s ease',
                }}
              >
                <i className="fa-solid fa-rotate-left" />
                View All Products
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
