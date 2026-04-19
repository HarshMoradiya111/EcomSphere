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
      {/* SHOP HEADER */}
      <section className="relative w-full h-[180px] md:h-[250px] bg-[url('/img/banner/b1.jpg')] bg-cover bg-center flex flex-col justify-center items-center text-center px-4">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-2 italic" style={{ color: 'white' }}>#stayhome</h2>
          <p className="text-sm md:text-lg font-medium tracking-wide" style={{ color: 'white' }}>Save more with coupons & up to 70% off!</p>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="px-4 py-8 md:px-20 md:py-16 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-1">Explore Collection</h2>
            <p className="text-gray-500 text-sm md:text-base">Find your perfect style from our summer arrivals</p>
          </div>
          
          {/* Mobile Quick Sort Helper could go here, but ProductList handles it */}
        </div>

        {/* ProductList now has a responsive 2-col grid built-in */}
        <ProductList />
      </main>

      {/* MOBILE STICKY FILTER ACTION BAR (Flipkart Style) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-14 bg-white border-t border-gray-200 z-[999] flex items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button className="flex-1 h-full flex items-center justify-center gap-2 border-r border-gray-100 font-bold text-gray-700 text-sm active:bg-gray-50 transition-colors">
          <i className="fa-solid fa-arrow-down-wide-short text-[#088178]"></i>
          SORT
        </button>
        <button className="flex-1 h-full flex items-center justify-center gap-2 font-bold text-gray-700 text-sm active:bg-gray-50 transition-colors">
          <i className="fa-solid fa-filter text-[#088178]"></i>
          FILTER
        </button>
      </div>

      {/* STICKY BAR SPACER FOR MOBILE */}
      <div className="md:hidden h-14"></div>

      {/* NEWSLETTER */}
      <section className="bg-[#041e42] py-12 px-4 md:px-20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left text-white">
          <h4 className="text-2xl font-black mb-2">Sign Up For Newsletters</h4>
          <p className="text-gray-400 text-sm md:text-base">Get E-mail updates about our latest shop and <span className="text-[#ffbd27] font-bold">special offers.</span></p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="w-full md:w-[350px] px-6 py-4 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#088178]"
          />
          <button className="bg-[#088178] text-white px-10 py-4 rounded-md font-bold text-sm whitespace-nowrap hover:bg-[#06665f] transition-all">
            Sign Up
          </button>
        </div>
      </section>
    </StorefrontShell>
  );
}
