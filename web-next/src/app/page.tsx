import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import SafeImage from '@/components/SafeImage';
import { API_URL } from '@/config';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import { getProductImageSrc, getProductImageFallbackSrc } from '@/utils/imagePaths';

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  averageRating?: number;
  numReviews?: number;
};

type MarketingAssets = {
  banners?: Array<{ image: string; subtitle?: string; title?: string; buttonLink?: string; buttonText?: string }>;
  flashSale?: { isActive?: boolean; title?: string; discountText?: string } | null;
};

async function fetchHomeData() {
  try {
    const [productsRes, marketingRes] = await Promise.all([
      fetch(`${API_URL}/api/v1/products`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/v1/products/marketing/assets`, { cache: 'no-store' }),
    ]);

    const productsJson = productsRes.ok ? await productsRes.json() : { grouped: {} };
    const marketingJson = marketingRes.ok ? await marketingRes.json() : {};

    return {
      grouped: (productsJson.grouped || {}) as Record<string, Product[]>,
      marketing: marketingJson as MarketingAssets,
    };
  } catch {
    return {
      grouped: {} as Record<string, Product[]>,
      marketing: {} as MarketingAssets,
    };
  }
}

export default async function HomePage() {
  const { grouped, marketing } = await fetchHomeData();
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  const banner = marketing?.banners?.[0];
  const categoryEntries = Object.entries(grouped || {});

  return (
    <StorefrontShell
      header={{ activePage: 'home', sessionUser }}
      settings={settings}
      sessionUser={sessionUser}
      success={[]}
      errors={[]}
    >
      {banner ? (
        <section id="hero" style={{ backgroundImage: `url('/uploads/${banner.image}')` }}>
          <h4>{banner.subtitle || 'Trade-in-offer'}</h4>
          <h2>{banner.title || 'Super value deals'}</h2>
          <h1>On all products</h1>
          <p>Save more with loyalty points & free delivery!</p>
          <a href={banner.buttonLink || '/shop'}><button>{banner.buttonText || 'Shop now'}</button></a>
        </section>
      ) : (
        <section id="hero">
          <h4>Trade-in-offer</h4>
          <h2>Super value deals</h2>
          <h1>On all products</h1>
          <p>Save more with coupon & up to 70% off!</p>
          <a href="/shop"><button>Shop now</button></a>
        </section>
      )}

      <section id="feature" className="section-p1">
        {['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].map((id, idx) => (
          <div className="fe-box" key={id}>
            <img src={`/img/features/${id}.jpg`} alt="Feature" />
            <h6>{['Free Shipping', 'Online Order', 'Save Money', 'Promotion', 'Happy Sell', 'Support'][idx]}</h6>
          </div>
        ))}
      </section>

      {categoryEntries.map(([category, products]) => {
        if (!products || products.length === 0) return null;

        return (
          <section key={category} id={category.toLowerCase().replace(/ /g, '-')} className="section-p1 product-section">
            <style>{`
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
            <h2>{category}</h2>
            <p>Explore our {category} collection</p>
            <div className="pro-container">
              {products.map((product) => {
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
                      href="#"
                      className="action-btn toggle-wishlist"
                      data-product-id={product._id}
                      title="Wishlist"
                    >
                      <i className="fa-regular fa-heart"></i>
                    </a>
                    <a
                      className="action-btn compare-btn"
                      href={`/compare?ids=${encodeURIComponent(product._id)}`}
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
              })}
            </div>
          </section>
        );
      })}

      <section id="banner" className="section-m1">
        {marketing?.flashSale?.isActive ? (
          <>
            <h4>{marketing.flashSale.title || 'Flash Sale'}</h4>
            <h2>{marketing.flashSale.discountText || 'Limited Time Offers'}</h2>
            <a href="/shop"><button className="normal">Explore Now</button></a>
          </>
        ) : (
          <>
            <h4>Repair service</h4>
            <h2>Up to <span>70% off</span> - All T-Shirts & Accessories</h2>
            <a href="/shop"><button className="normal">Explore More</button></a>
          </>
        )}
      </section>
    </StorefrontShell>
  );
}
