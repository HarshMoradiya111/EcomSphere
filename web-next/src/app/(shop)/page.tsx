'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AddToCartButton from '@/features/cart/AddToCartButton';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';


export default function HomeHub() {
  const [groupedProducts, setGroupedProducts] = useState<any>({});
  const [marketing, setMarketing] = useState<any>({ banners: [], flashSale: null });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, markRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/products`),
          fetch(`${API_URL}/api/v1/products/marketing/assets`)
        ]);
        const prodData = await prodRes.json();
        const markData = await markRes.json();

        if (prodData.success) setGroupedProducts(prodData.grouped);
        if (markData.success) setMarketing(markData);
      } catch (err) {
        console.error('Cluster sync failure');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Countdown Logic for Flash Sale
  useEffect(() => {
    if (!marketing.flashSale) return;
    const interval = setInterval(() => {
       const distance = new Date(marketing.flashSale.endTime).getTime() - new Date().getTime();
       if (distance < 0) {
           setTimeLeft(null);
           clearInterval(interval);
           return;
       }
       setTimeLeft({
           days: Math.floor(distance / (1000 * 60 * 60 * 24)),
           hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
           minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
           seconds: Math.floor((distance % (1000 * 60)) / 1000)
       });
    }, 1000);
    return () => clearInterval(interval);
  }, [marketing.flashSale]);

  if (loading) return <div className="p-20 text-center animate-pulse text-teal-600 font-bold uppercase tracking-widest text-xs">Streaming Global Marketplace...</div>;

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. Global Hero Deployment (Dynamic Banners) */}
      <section className="relative h-[85vh] bg-gray-950 flex items-center px-12 md:px-24 overflow-hidden">
          {marketing.banners.length > 0 ? (
              <div className="absolute inset-0 z-0">
                  <img 
                    src={`${API_URL}/uploads/${marketing.banners[0].image}`} 
                    className="w-full h-full object-cover opacity-50" 
                    alt="Hero"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950 to-transparent"></div>
              </div>
          ) : (
             <div className="absolute inset-0 bg-teal-950 opacity-20"></div>
          )}
          
          <div className="relative z-10 max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
              <h4 className="text-teal-400 font-black uppercase tracking-[0.4em] text-xs mb-4">
                  {marketing.banners[0]?.subtitle || 'Trade-in-offer'}
              </h4>
              <h2 className="text-white text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 italic">
                  {marketing.banners[0]?.title || 'Super Value Deals'}
              </h2>
              <h1 className="text-white text-4xl md:text-5xl font-black tracking-tighter mb-8 opacity-80">
                  On All Products
              </h1>
              <p className="text-gray-400 text-lg font-medium mb-10 max-w-xl">
                  Save more with our loyalty program & free global shipping on all premium assets. 
              </p>
              <Link href="/shop" className="px-10 py-5 bg-teal-600 text-white font-black rounded-full hover:bg-white hover:text-black transition-all uppercase tracking-widest text-xs shadow-2xl">
                  Explore Now
              </Link>
          </div>
      </section>

      {/* 2. Features Matrix */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-12 md:p-24 bg-white">
          {[
              { id: 'f1', label: 'Free Shipping' },
              { id: 'f2', label: 'Online Order' },
              { id: 'f3', label: 'Save Money' },
              { id: 'f4', label: 'Promotion' },
              { id: 'f5', label: 'Happy Sell' },
              { id: 'f6', label: '24/7 Support' }
          ].map((f) => (
              <div key={f.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all group">
                  <img src={`${API_URL}/img/features/${f.id}.jpg`} alt={f.label} className="w-16 h-16 object-contain mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-800">{f.label}</span>
              </div>
          ))}
      </section>

      {/* 3. Global Inventory: Categorized Grouping */}
      {Object.keys(groupedProducts).map((category) => (
          <section key={category} className="p-12 md:p-24 border-t border-gray-50">
              <div className="flex justify-between items-end mb-16">
                  <div>
                      <h2 className="text-5xl font-black text-gray-950 tracking-tighter italic">{category.split(' ')[0]} <span className="text-gray-300 not-italic">{category.split(' ')[1] || 'Collection'}</span></h2>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1">Curated Inventory Retrieval</p>
                  </div>
                  <Link href={`/category/${category.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-black transition-colors">View All &rarr;</Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  {groupedProducts[category].map((product: any) => (
                      <div key={product._id} className="group relative">
                          <div className="aspect-[4/5] bg-gray-50 rounded-[3rem] overflow-hidden mb-6 relative">
                              <img 
                                src={getImageUrl(product.image)} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                alt={product.name}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                          </div>
                          <div className="px-4">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{product.category}</span>
                              <Link href={`/product/${product._id}`} className="text-xl font-black text-gray-950 tracking-tight hover:text-teal-600 transition-colors uppercase leading-tight line-clamp-1">
                                {product.name}
                              </Link>
                              <div className="flex justify-between items-center mt-4">
                                  <span className="text-2xl font-black text-teal-700 tracking-tighter italic">₹{product.price.toLocaleString()}</span>
                                  <AddToCartButton 
                                      productId={product._id}
                                      productName={product.name}
                                      price={product.price}
                                      image={product.image}
                                  />
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
      ))}

      {/* 4. Flash Sale: Real-Time Synchronization */}
      {marketing.flashSale && (
          <section className="mx-12 md:mx-24 my-12 relative h-[50vh] rounded-[4rem] overflow-hidden flex flex-col items-center justify-center text-center p-12 bg-gray-950">
              <div className="absolute inset-0 bg-[url('${API_URL}/img/banner/b2.jpg')] bg-cover bg-center opacity-30"></div>
              <div className="relative z-10">
                  <h4 className="text-rose-400 font-black uppercase tracking-[0.4em] text-[10px] mb-6">{marketing.flashSale.title}</h4>
                  <h2 className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-10 italic">{marketing.flashSale.discountText}</h2>
                  
                  {timeLeft && (
                      <div className="flex gap-8 md:gap-16 mb-12">
                          {Object.entries(timeLeft).map(([unit, value]) => (
                              <div key={unit} className="flex flex-col items-center">
                                  <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{value as number}</span>
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{unit}</span>
                              </div>
                          ))}
                      </div>
                  )}

                  <Link href="/shop" className="px-10 py-5 bg-white text-black font-black rounded-full hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest text-[10px]">
                      Explore Now
                  </Link>
              </div>
          </section>
      )}

      {/* 5. Newsletter: Marketing Bridge */}
      <section className="bg-gray-50 p-24 text-center">
          <div className="max-w-2xl mx-auto">
              <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em] mb-4">Signal Hub</h4>
              <h2 className="text-5xl font-black text-gray-950 tracking-tighter mb-6 italic">Stay <span className="text-gray-300 not-italic">Synchronized.</span></h2>
              <p className="text-gray-500 font-medium mb-10 text-lg">Receive encrypted updates about our latest arrivals and loyalty deployments.</p>
              <form className="flex gap-4 p-2 bg-white rounded-full shadow-xl border border-gray-100 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="E-mail payload..." 
                    className="flex-1 bg-transparent px-8 outline-none font-bold placeholder:text-gray-300"
                  />
                  <button className="px-8 py-4 bg-teal-950 text-white font-black rounded-full text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all">Sign Up</button>
              </form>
          </div>
      </section>
    </main>
  );
}
