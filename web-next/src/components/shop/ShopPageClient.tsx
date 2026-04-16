'use client';

import { useEffect, useMemo, useState } from 'react';
import SafeImage from '@/src/components/SafeImage';
import { getProductImageFallbackSrc, getProductImageSrc } from '@/src/utils/imagePaths';

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
        <div style={{ fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#088178' }}>
          Loading products...
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .filter-btn {
          padding: 10px 22px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: 0.3s;
          background: #f0f0f0;
          color: #333;
        }
        .filter-btn.active,
        .filter-btn:hover {
          background: #088178;
          color: #fff;
        }
        .pro .action-btn {
          position: absolute;
          right: 15px;
          background: rgba(255, 255, 255, 0.92);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.3s;
        }
        .pro .toggle-wishlist {
          top: 15px;
          color: #ccc;
        }
        .pro .toggle-wishlist.active {
          color: #ff4d4d;
        }
        .pro .compare-btn {
          top: 60px;
          color: #088178;
        }
        .pro .action-btn:hover {
          transform: scale(1.1);
          background: #fff;
        }
      `}</style>

      <section className="section-p1" style={{ paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/shop" className={`filter-btn ${!selectedCategory ? 'active' : ''}`}>All Products</a>
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

      <section className="section-p1" style={{ paddingTop: 0 }}>
        <form
          action="/shop"
          method="GET"
          id="filter-form"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            background: '#f9f9f9',
            padding: '25px',
            borderRadius: '15px',
            border: '1px solid #eee',
          }}
        >
          <input type="hidden" name="category" value={selectedCategory} />

          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Search Keyword
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '14px' }}></i>
              <input
                type="text"
                name="search"
                defaultValue={normalizedSearch}
                placeholder="Try 'Summer dress'..."
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: '0.3s' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Price Limit: ₹{Math.round(resolvedMaxPrice).toLocaleString('en-IN')}
            </label>
            <div style={{ padding: '10px 0' }}>
              <input
                type="range"
                name="maxPrice"
                min={Math.round(minPossible)}
                max={Math.round(maxPossible)}
                defaultValue={Math.round(resolvedMaxPrice)}
                step={100}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#088178' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
                <span>₹{Math.round(minPossible).toLocaleString('en-IN')}</span>
                <span>₹{Math.round(maxPossible).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input type="hidden" name="minPrice" value={Math.round(resolvedMinPrice)} />
          </div>

          <div style={{ width: '220px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sort Results
            </label>
            <select
              name="sortBy"
              defaultValue={normalizedSortBy}
              style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="normal" style={{ padding: '13px 35px', borderRadius: '8px', fontSize: '14px', height: '46px' }}>
              Apply Filters
            </button>
          </div>
        </form>
      </section>

      <section id="product1" className="section-p1">
        {normalizedSearch ? <h2>Search Results for "{normalizedSearch}"</h2> : <h2>{selectedCategory || 'All Products'}</h2>}
        <p>{products.length} product{products.length !== 1 ? 's' : ''} found</p>

        <div className="pro-container">
          {products.length > 0 ? (
            products.map((product) => {
              const avg = Math.round(product.averageRating || 0);
              return (
                <div className="pro" key={product._id}>
                  <a href={`/product/${product._id}`}>
                    <SafeImage
                      src={getProductImageSrc(product.image)}
                      fallbackSrc={getProductImageFallbackSrc(product.image)}
                      alt={product.name}
                    />
                  </a>
                  <div className="des">
                    <span>{product.category}</span>
                    <div className="star" style={{ margin: '5px 0' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={`${product._id}-star-${i}`}
                          className={`fa-${i + 1 <= avg ? 'solid' : 'regular'} fa-star`}
                          style={{ color: '#ffbd27', fontSize: '12px' }}
                        ></i>
                      ))}
                      <small style={{ color: '#888', marginLeft: '5px' }}>({product.numReviews || 0})</small>
                    </div>
                    <h5>{product.name}</h5>
                    <p>{(product.description || '').substring(0, 60)}...</p>
                    <h4>₹{Number(product.price).toLocaleString('en-IN')}</h4>
                  </div>

                  <a
                    href={sessionUser ? '#' : '/auth/login'}
                    className={`action-btn toggle-wishlist ${wishlistIdSet.has(product._id) ? 'active' : ''}`}
                    data-product-id={product._id}
                    title={sessionUser ? 'Wishlist' : 'Login to add wishlist'}
                    style={wishlistIdSet.has(product._id) ? { color: '#ff4d4d' } : undefined}
                  >
                    <i className={`fa-${wishlistIdSet.has(product._id) ? 'solid' : 'regular'} fa-heart`}></i>
                  </a>

                  <a className="action-btn compare-btn" href="#" data-product-id={product._id} title="Compare">
                    <i className="fa-solid fa-scale-unbalanced-flip"></i>
                  </a>
                  <a
                    href="#"
                    className="add-to-cart cart1"
                    data-product-id={product._id}
                    data-name={product.name}
                    data-price={product.price}
                    data-image={product.image}
                    title="Add to Cart"
                  >
                    <i className="fa-solid fa-cart-shopping"></i>
                  </a>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '60px 20px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '60px', color: '#ccc' }}></i>
              <p style={{ color: '#888', marginTop: '15px', fontSize: '18px' }}>No products found in this category.</p>
              <a
                href="/shop"
                style={{ display: 'inline-block', marginTop: '15px', padding: '12px 28px', background: '#088178', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}
              >
                View All Products
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}