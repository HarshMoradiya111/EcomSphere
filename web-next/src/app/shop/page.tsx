import { cookies } from 'next/headers';
import StorefrontShell from '@/src/components/ejs-partials/StorefrontShell';
import SafeImage from '@/src/components/SafeImage';
import { API_URL } from '@/src/config';
import { getSessionUsername } from '@/src/server/sessionUser';
import { getSiteSettings } from '@/src/server/siteSettings';
import { getProductImageFallbackSrc, getProductImageSrc } from '@/src/utils/imagePaths';

const CATEGORIES = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'] as const;

type ShopSearchParams = {
  category?: string | string[];
  search?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  sortBy?: string | string[];
};

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

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function toNumber(value: string, fallback: number): number {
  if (!value.trim()) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProductsPayload(payload: any): Product[] {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (payload?.grouped && typeof payload.grouped === 'object') {
    return Object.values(payload.grouped).flatMap((items: any) => (Array.isArray(items) ? items : []));
  }

  return [];
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products`, { cache: 'no-store' });
    if (!res.ok) return [];

    const json = await res.json();
    return normalizeProductsPayload(json);
  } catch {
    return [];
  }
}

async function fetchWishlistIds(): Promise<Set<string>> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    if (!cookieHeader) {
      return new Set();
    }

    const response = await fetch(`${API_URL}/wishlist`, {
      cache: 'no-store',
      headers: { cookie: cookieHeader },
    });

    if (!response.ok) {
      return new Set();
    }

    const html = await response.text();
    const matches = Array.from(html.matchAll(/data-product-id=["']([^"']+)["']/g));
    return new Set(matches.map((match) => match[1]));
  } catch {
    return new Set();
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: ShopSearchParams;
}) {
  const allProducts = await fetchProducts();
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  const wishlistIds = sessionUser ? await fetchWishlistIds() : new Set<string>();

  const selectedCategoryRaw = firstValue(searchParams?.category).trim();
  const selectedCategory = CATEGORIES.includes(selectedCategoryRaw as (typeof CATEGORIES)[number])
    ? selectedCategoryRaw
    : '';
  const search = firstValue(searchParams?.search).trim();
  const minPriceParam = firstValue(searchParams?.minPrice).trim();
  const maxPriceParam = firstValue(searchParams?.maxPrice).trim();
  const sortByRaw = firstValue(searchParams?.sortBy).trim();
  const sortBy = ['newest', 'oldest', 'price-low', 'price-high'].includes(sortByRaw) ? sortByRaw : 'newest';

  const allPrices = allProducts.map((product) => Number(product.price)).filter((price) => Number.isFinite(price));
  const minPossible = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPossible = allPrices.length > 0 ? Math.max(...allPrices) : 10000;

  let minPrice = Math.max(minPossible, toNumber(minPriceParam, minPossible));
  let maxPrice = Math.min(maxPossible, toNumber(maxPriceParam, maxPossible));
  if (minPrice > maxPrice) {
    const tmp = minPrice;
    minPrice = maxPrice;
    maxPrice = tmp;
  }

  let products = allProducts.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }

    if (search) {
      const needle = search.toLowerCase();
      const searchable = `${product.name || ''} ${product.description || ''}`.toLowerCase();
      if (!searchable.includes(needle)) {
        return false;
      }
    }

    if (allPrices.length === 0) {
      return true;
    }

    const price = Number(product.price) || 0;
    if (price < minPrice || price > maxPrice) {
      return false;
    }

    return true;
  });

  products = products.sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-high') return Number(b.price) - Number(a.price);

    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    if (sortBy === 'oldest') return dateA - dateB;
    return dateB - dateA;
  });

  return (
    <StorefrontShell
      header={{ activePage: 'shop', sessionUser }}
      settings={settings}
      sessionUser={sessionUser}
      breadcrumbs={[{ name: 'Shop', url: '/shop' }]}
      success={[]}
      errors={[]}
    >
      <section id="page-header">
        <h2>Shop All Products</h2>
        <p>Browse our complete collection</p>
      </section>

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
          {CATEGORIES.map((category) => (
            <a
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
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
                defaultValue={search}
                placeholder="Try 'Summer dress'..."
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: '0.3s' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Price Limit: ₹{Math.round(maxPrice).toLocaleString('en-IN')}
            </label>
            <div style={{ padding: '10px 0' }}>
              <input
                type="range"
                name="maxPrice"
                min={Math.round(minPossible)}
                max={Math.round(maxPossible)}
                defaultValue={Math.round(maxPrice)}
                step={100}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#088178' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
                <span>₹{Math.round(minPossible).toLocaleString('en-IN')}</span>
                <span>₹{Math.round(maxPossible).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input type="hidden" name="minPrice" value={Math.round(minPrice)} />
          </div>

          <div style={{ width: '220px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sort Results
            </label>
            <select
              name="sortBy"
              defaultValue={sortBy}
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
        {search ? <h2>Search Results for "{search}"</h2> : <h2>{selectedCategory || 'All Products'}</h2>}
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
                    className={`action-btn toggle-wishlist ${wishlistIds.has(product._id) ? 'active' : ''}`}
                    data-product-id={product._id}
                    title={sessionUser ? 'Wishlist' : 'Login to add wishlist'}
                    style={wishlistIds.has(product._id) ? { color: '#ff4d4d' } : undefined}
                  >
                    <i className={`fa-${wishlistIds.has(product._id) ? 'solid' : 'regular'} fa-heart`}></i>
                  </a>

                  <a
                    className="action-btn compare-btn"
                    href="#"
                    data-product-id={product._id}
                    title="Compare"
                  >
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
    </StorefrontShell>
  );
}
