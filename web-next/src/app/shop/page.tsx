import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
export const dynamic = 'force-dynamic';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import ProductList from '@/features/shop/ProductList';

export default async function ShopPage() {
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <StorefrontShell
      header={{ activePage: 'shop', sessionUser }}
      settings={settings}
      sessionUser={sessionUser}
      breadcrumbs={[{ name: 'Shop', url: '/shop' }]}
      success={[]}
      errors={[]}
    >
      <section id="page-header" className="about-header">
        <h2>#stayhome</h2>
        <p>Save more with coupons & up to 70% off!</p>
      </section>

      <section id="product1" className="section-p1">
        <h2>Featured Collection</h2>
        <p>Summer Collection New Modern Design</p>
        <ProductList />
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
