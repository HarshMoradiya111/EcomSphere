'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import { getProductImageSrc, getProductImageFallbackSrc } from '@/utils/imagePaths';
import { API_URL } from '@/config';
import Link from 'next/link';
import { getToken } from '@/utils/auth';

const FONT = '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  averageRating?: number;
  numReviews?: number;
}

/* ─── Inline CSS (scoped to ProductList) ─── */
const CARD_CSS = `
  @keyframes pl-spin { to { transform: rotate(360deg); } }

  .pl-card {
    font-family: "Poppins", -apple-system, sans-serif;
    background: #ffffff;
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
  .pl-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(8,129,120,0.14);
  }

  /* Image wrapper */
  .pl-img-wrap {
    position: relative;
    aspect-ratio: 4/5;
    overflow: hidden;
    background: linear-gradient(135deg, #f0f9f8 0%, #f7fffe 100%);
  }
  .pl-img-wrap img, .pl-img-wrap > div {
    transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94) !important;
  }
  .pl-card:hover .pl-img-wrap img,
  .pl-card:hover .pl-img-wrap > div {
    transform: scale(1.07) !important;
  }

  /* Quick-actions overlay */
  .pl-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 60%, transparent 100%);
    opacity: 0;
    transition: opacity 0.35s ease;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 16px;
    gap: 10px;
  }
  .pl-card:hover .pl-overlay { opacity: 1; }

  .pl-qa-btn {
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(6px);
    border: none;
    border-radius: 50px;
    padding: 9px 18px;
    font-size: 12px;
    font-weight: 700;
    color: #088178;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    transition: background 0.2s, color 0.2s, transform 0.2s;
    white-space: nowrap;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    transform: translateY(8px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .pl-card:hover .pl-qa-btn {
    opacity: 1;
    transform: translateY(0);
  }
  .pl-card:hover .pl-qa-btn:nth-child(2) { transition-delay: 0.04s; }
  .pl-card:hover .pl-qa-btn:nth-child(3) { transition-delay: 0.08s; }

  .pl-qa-btn:hover { background: #088178; color: #fff; }
  .pl-qa-btn.cart-btn:hover { background: #088178; color: #fff; }
  .pl-qa-btn.wish-btn.wishlisted { background: #fff0f2; color: #ff4757; }

  /* Category badge */
  .pl-badge {
    position: absolute;
    top: 14px;
    left: 14px;
    font-family: "Poppins", sans-serif;
    background: linear-gradient(135deg, #088178 0%, #06a899 100%);
    color: #fff;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 9999px;
    box-shadow: 0 4px 12px rgba(8,129,120,0.35);
  }

  /* Content area */
  .pl-content {
    font-family: "Poppins", sans-serif;
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 5px;
  }

  /* Product name — tight, bold, premium */
  .pl-name {
    font-family: "Poppins", sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: #1a1a2e;
    text-decoration: none;
    line-height: 1.4;
    letter-spacing: -0.1px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.2s ease;
  }
  .pl-name:hover { color: #088178; }

  /* Stars */
  .pl-stars { display: flex; align-items: center; gap: 2px; margin-bottom: 2px; }
  .pl-star { font-size: 10px; }
  .pl-star.filled { color: #f0a500; }
  .pl-star.empty  { color: #dde3eb; }
  .pl-review-count {
    font-family: "Poppins", sans-serif;
    font-size: 10px;
    color: #a0aec0;
    font-weight: 600;
    letter-spacing: 0.2px;
    margin-left: 3px;
  }

  /* Price row */
  .pl-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid #f1f5f9;
  }
  .pl-price {
    font-family: "Poppins", sans-serif;
    font-size: 19px;
    font-weight: 800;
    color: #088178;
    letter-spacing: -0.6px;
    line-height: 1;
  }
  .pl-view-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e8f8f7 0%, #f0fffe 100%);
    border: 1.5px solid rgba(8,129,120,0.2);
    color: #088178;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 12px;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .pl-view-btn:hover {
    background: #088178;
    color: #fff;
    border-color: #088178;
    transform: scale(1.12);
  }

  /* Skeleton loader */
  @keyframes pl-shimmer { 0%{background-position:-468px 0;} 100%{background-position:468px 0;} }
  .pl-skeleton {
    background: linear-gradient(90deg, #f0f4f8 25%, #e8edf2 50%, #f0f4f8 75%);
    background-size: 936px 100%;
    animation: pl-shimmer 1.4s infinite linear;
    border-radius: 12px;
  }

  /* Filter row */
  .pl-filter-row {
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
    flex-wrap: wrap;
    align-items: center;
  }
  .pl-search-wrap { flex: 1; min-width: 220px; position: relative; }
  .pl-search-input {
    width: 100%;
    height: 46px;
    padding: 0 16px 0 44px;
    background: #f8fafc;
    border: 1.5px solid #edf2f7;
    border-radius: 12px;
    font-size: 13.5px;
    font-family: "Poppins", sans-serif;
    font-weight: 500;
    color: #2d3436;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    letter-spacing: 0.1px;
  }
  .pl-search-input::placeholder { color: #b0bec5; font-weight: 400; }
  .pl-search-input:focus { border-color: #088178; box-shadow: 0 0 0 3px rgba(8,129,120,0.1); }
  .pl-search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #b0bec5; font-size: 13px; pointer-events: none; }
  .pl-select {
    height: 46px;
    padding: 0 36px 0 14px;
    background: #f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23718096' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 12px center;
    border: 1.5px solid #edf2f7;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    font-family: "Poppins", sans-serif;
    color: #2d3436;
    cursor: pointer;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    letter-spacing: 0.1px;
    transition: border-color 0.2s;
  }
  .pl-select:focus { border-color: #088178; }
  .pl-load-btn {
    font-family: "Poppins", sans-serif;
    background: linear-gradient(135deg, #088178 0%, #06a899 100%);
    color: #fff;
    padding: 14px 44px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 13.5px;
    letter-spacing: 0.4px;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(8,129,120,0.3);
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .pl-load-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(8,129,120,0.35); }
  .pl-load-btn:disabled { opacity: 0.7; cursor: not-allowed; }
`;

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="pl-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={`fa-solid fa-star pl-star ${i < rounded ? 'filled' : 'empty'}`}
        />
      ))}
      <span className="pl-review-count">({reviews})</span>
    </div>
  );
}

function ProductCard({ product, isInitiallyWishlisted }: { product: Product, isInitiallyWishlisted: boolean }) {
  const isNew = false; // could derive from createdAt if needed
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInitiallyWishlisted);
  }, [isInitiallyWishlisted]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = getToken();
    if (!token) {
      window.location.href = `/auth/login?redirect=/shop`;
      return;
    }
    
    setIsWishlistLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/user/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id })
      });
      const data = await res.json();
      if (data.success) {
        setIsWishlisted(data.action === 'added');
        window.dispatchEvent(new Event('wishlist-updated'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="pl-card" onClick={() => window.location.href = `/product/${product._id}`}>
      {/* Image */}
      <div className="pl-img-wrap">
        <Link href={`/product/${product._id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <SafeImage
            src={getProductImageSrc(product.image)}
            fallbackSrc={getProductImageFallbackSrc(product.image)}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Link>

        {/* Category badge */}
        <span className="pl-badge">{product.category}</span>
        {isNew && <span className="pl-new-tag">New</span>}

        <div className="pl-overlay">
          <button
            className={`pl-qa-btn wish-btn ${isWishlisted ? 'wishlisted' : ''}`}
            title="Wishlist"
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '11px' }} />
            ) : isWishlisted ? (
              <i className="fa-solid fa-heart" style={{ fontSize: '11px' }} />
            ) : (
              <i className="fa-regular fa-heart" style={{ fontSize: '11px' }} />
            )}
            Wishlist
          </button>
          <a
            href="#"
            className="pl-qa-btn cart-btn add-to-cart cart1"
            data-product-id={product._id}
            data-name={product.name}
            data-price={product.price}
            data-image={product.image}
            title="Add to Cart"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fa-solid fa-bag-shopping" style={{ fontSize: '11px' }} />
            Add to Cart
          </a>
          <Link href={`/product/${product._id}`} className="pl-qa-btn" title="View Product" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-eye" style={{ fontSize: '11px' }} />
            View
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="pl-content">
        <StarRating rating={product.averageRating || 0} reviews={product.numReviews || 0} />
        <Link href={`/product/${product._id}`} className="pl-name">
          {product.name}
        </Link>
        {product.description && (
          <p style={{
            fontFamily: FONT,
            fontSize: '11px',
            fontWeight: 400,
            color: '#b0bec5',
            margin: '0',
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
        <div className="pl-price-row">
          <span className="pl-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          <Link href={`/product/${product._id}`} className="pl-view-btn" title="View Details" onClick={(e) => e.stopPropagation()}>
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="pl-card" style={{ pointerEvents: 'none' }}>
      <div className="pl-img-wrap">
        <div className="pl-skeleton" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="pl-content" style={{ gap: '10px' }}>
        <div className="pl-skeleton" style={{ height: '10px', width: '50%', borderRadius: '6px' }} />
        <div className="pl-skeleton" style={{ height: '14px', width: '90%', borderRadius: '6px' }} />
        <div className="pl-skeleton" style={{ height: '14px', width: '70%', borderRadius: '6px' }} />
        <div className="pl-skeleton" style={{ height: '20px', width: '40%', borderRadius: '6px', marginTop: 'auto' }} />
      </div>
    </div>
  );
}

function ProductListContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('newest');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const [cols, setCols] = useState(4);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/api/v1/user/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.wishlist) {
          setWishlistIds(data.wishlist.map((w: any) => w._id || w));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 480) setCols(1);
      else if (w < 768) setCols(2);
      else if (w < 1024) setCols(3);
      else setCols(4);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const limit = 20;

  const fetchProducts = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        category,
        search,
        sort,
      });

      const res = await fetch(`${API_URL}/api/v1/products?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        if (pageNum === 1 || isNewFilter) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }
        setHasMore(data.currentPage < data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [category, search, sort]);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/products/categories/list`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAllCategories(data.categories);
      })
      .catch(err => console.error('Category fetch error:', err));
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [category, sort, fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '20px',
    width: '100%',
  };

  return (
    <div style={{ width: '100%' }}>
      <style dangerouslySetInnerHTML={{ __html: CARD_CSS }} />

      {/* ── Filter Controls ── */}
      <div className="pl-filter-row">
        <div className="pl-search-wrap">
          <i className="fa-solid fa-magnifying-glass pl-search-icon" />
          <input
            type="text"
            className="pl-search-input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="pl-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          className="pl-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="priceAsc">Price ↑</option>
          <option value="priceDesc">Price ↓</option>
          <option value="nameAsc">Name A–Z</option>
        </select>
      </div>

      {/* ── Product Grid ── */}
      {initialLoad ? (
        <div style={gridStyle}>
          {Array.from({ length: cols * 2 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length > 0 ? (
        <div style={gridStyle}>
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              isInitiallyWishlisted={wishlistIds.includes(product._id)}
            />
          ))}
          {/* Loading skeletons for load-more */}
          {loading && Array.from({ length: cols }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', gridColumn: '1 / -1' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#f7f8fc', border: '1px solid #edf2f7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '28px', color: '#c8d6e5' }} />
          </div>
          <h4 style={{ color: '#1a1a2e', fontWeight: 700, marginBottom: '8px' }}>No products found</h4>
          <p style={{ color: '#a0aec0', fontSize: '14px' }}>Try adjusting your filters.</p>
        </div>
      )}

      {/* ── Load More ── */}
      {hasMore && !initialLoad && (
        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', paddingBottom: '24px' }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="pl-load-btn"
          >
            {loading
              ? <><i className="fa-solid fa-circle-notch" style={{ animation: 'pl-spin 0.8s linear infinite', marginRight: '8px' }} />Loading…</>
              : <><i className="fa-solid fa-chevron-down" style={{ marginRight: '8px' }} />Load More</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductList() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}>
        <i className="fa-solid fa-circle-notch" style={{ fontSize: '24px', color: '#088178', animation: 'pl-spin 0.8s linear infinite', display: 'block', marginBottom: '12px' }} />
        Loading products…
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
