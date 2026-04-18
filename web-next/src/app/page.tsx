import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import { API_URL } from '@/config';
import { getSessionUsername } from '@/server/sessionUser';
export const dynamic = 'force-dynamic';
import { getSiteSettings } from '@/server/siteSettings';
import ProductList from '@/features/shop/ProductList';

type MarketingAssets = {
  banners?: Array<{ image: string; subtitle?: string; title?: string; buttonLink?: string; buttonText?: string }>;
  flashSale?: { isActive?: boolean; title?: string; discountText?: string } | null;
};

async function fetchMarketingData() {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/marketing/assets`, { cache: 'no-store' });
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const marketingJson = await fetchMarketingData();
  const marketing = marketingJson as MarketingAssets;
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();
  const banner = marketing?.banners?.[0];

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

      <section id="product1" className="section-p1">
        <h2>Featured Products</h2>
        <p>Summer Collection New Modern Design</p>
        {/* Unified paginated product list with Load More */}
        <ProductList />
      </section>

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

      <section id="newsletter" className="section-p1 section-m1">
        <div className="newstext">
          <h4>Sign Up For Newsletters</h4>
          <p>Get E-mail updates about our latest shop and <span>special offers.</span></p>
        </div>
        <div className="form">
          <input type="text" placeholder="Your email address" />
          <button className="normal">Sign Up</button>
        </div>
      </section>
    </StorefrontShell>
  );
}
