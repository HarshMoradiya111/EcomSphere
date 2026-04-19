import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import SafeImage from '@/components/SafeImage';
import { API_URL } from '@/config';
import { getSiteSettings } from '@/server/siteSettings';
import { getProductImageSrc, getProductImageFallbackSrc } from '@/utils/imagePaths';
import Link from 'next/link';
import AddToCartButton from '@/features/cart/AddToCartButton';

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  countInStock?: number;
  status?: string;
  sizes?: string[];
  colors?: string[];
};

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  const settings = await getSiteSettings();

  if (!product) {
    return (
      <StorefrontShell
        header={{ activePage: 'shop' }}
        settings={settings}
        breadcrumbs={[{ name: 'Shop', url: '/shop' }, { name: 'Product', url: `/product/${params.id}` }]}
        errors={['Product not found']}
      >
        <section className="px-4 py-20 text-center">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-50 mb-6">
            <i className="fa-solid fa-triangle-exclamation text-4xl text-red-400"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Product not found</h2>
          <Link href="/shop" className="text-[#088178] font-bold hover:underline">Return to collection</Link>
        </section>
      </StorefrontShell>
    );
  }

  const productStock = Number(product.countInStock || 0);

  return (
    <StorefrontShell
      header={{ activePage: 'shop' }}
      settings={settings}
      breadcrumbs={[
        { name: 'Shop', url: '/shop' },
        { name: product.category, url: `/shop?category=${encodeURIComponent(product.category)}` },
        { name: product.name, url: `/product/${product._id}` },
      ]}
    >
      <main className="md:px-20 md:py-12 bg-white">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          
          {/* IMAGE SECTION: FULL WIDTH ON MOBILE */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden md:rounded-2xl border border-gray-100 shadow-sm">
              <SafeImage
                src={getProductImageSrc(product.image)}
                fallbackSrc={getProductImageFallbackSrc(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {productStock === 0 && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white text-black px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm">Sold Out</span>
                </div>
              )}
            </div>
            
            {/* THUMBNAILS (Simplified) */}
            <div className="mt-4 flex gap-2 px-4 md:px-0">
               <div className="h-20 w-16 border-2 border-[#088178] rounded-md overflow-hidden bg-gray-50 p-1">
                 <img src={getProductImageSrc(product.image)} className="w-full h-full object-cover" alt="Thumb" />
               </div>
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="flex-1 px-4 md:px-0 pb-24 md:pb-0">
            <div className="mb-6">
              <Link href={`/shop?category=${product.category}`} className="inline-block text-[11px] font-black tracking-widest text-[#088178] uppercase mb-2 bg-teal-50 px-3 py-1 rounded">
                {product.category}
              </Link>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl md:text-3xl font-black text-[#088178]">₹{Number(product.price).toLocaleString('en-IN')}</h2>
                 <span className="text-sm text-gray-400 line-through">₹{Number(product.price * 1.3).toLocaleString('en-IN')}</span>
                 <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">30% OFF</span>
              </div>
            </div>

            <div className="h-[1px] bg-gray-100 my-6"></div>

            {/* PRODUCT OPTIONS */}
            <div className="space-y-6">
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h6 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Select Size</h6>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button key={size} className="h-10 min-w-[3rem] px-3 border border-gray-200 rounded text-sm font-bold hover:border-[#088178] hover:text-[#088178] transition-all">
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <h6 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Available Colors</h6>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button 
                        key={color} 
                        className="h-8 w-8 rounded-full border border-gray-200 shadow-sm ring-offset-2 focus:ring-2 focus:ring-[#088178]"
                        title={color}
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h6 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Product Description</h6>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {product.description || 'No description available for this item.'}
                </p>
                
                {/* Product Highlights */}
                <ul className="grid grid-cols-2 gap-y-3 text-xs font-bold text-gray-700">
                  <li className="flex items-center gap-2"><i className="fa-solid fa-truck-fast text-[#088178]"></i> Free Delivery</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-rotate-left text-[#088178]"></i> 7-Day Returns</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-shield-halved text-[#088178]"></i> Secure Checkout</li>
                  <li className="flex items-center gap-2"><i className="fa-solid fa-tag text-[#088178]"></i> Best Price</li>
                </ul>
              </div>
            </div>

            {/* DESKTOP ADD TO CART */}
            <div className="hidden md:flex gap-4 mt-10">
              <AddToCartButton 
                productId={product._id}
                productName={product.name}
                price={product.price}
                image={product.image}
              />
              <button className="h-14 w-14 flex items-center justify-center border-2 border-[#088178] rounded-xl text-[#088178] hover:bg-teal-50 transition-colors">
                <i className="fa-regular fa-heart text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Meesho Style) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-[999] shadow-[0_-10px_25px_rgba(0,0,0,0.08)]">
        <div className="flex gap-3">
          <button className="h-12 px-5 border border-gray-200 rounded-lg text-gray-500 font-bold active:bg-gray-50">
            <i className="fa-regular fa-heart text-xl"></i>
          </button>
          <div className="flex-1 h-12">
             <AddToCartButton 
              productId={product._id}
              productName={product.name}
              price={product.price}
              image={product.image}
            />
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
