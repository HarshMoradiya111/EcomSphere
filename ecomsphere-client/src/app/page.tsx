import React from 'react';
import Link from 'next/link';

// Next.js Server Component that dramatically speeds up UI rendering!
// It securely fetches data from our Express /api/v1 endpoint in the background.
async function getProducts() {
  try {
    // Next.js connects seamlessly to our highly scalable JSON API layer
    const res = await fetch('http://localhost:3000/api/v1/products', { 
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    
    return res.json();
  } catch (error) {
    console.error(error);
    return { data: [] };
  }
}

function getImageUrl(image: any) {
  if (!image) return 'http://localhost:3000/img/placeholder.jpg';
  const imgStr = Array.isArray(image) ? image[0] : image;
  if (imgStr.startsWith('http')) return imgStr;
  
  // If the image string already contains a path like /img/products/
  if (imgStr.includes('/')) return `http://localhost:3000${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
  
  // If it's just a raw filename (from Multer admin uploads), EJS prepends /uploads/
  return `http://localhost:3000/uploads/${imgStr}`;
}

export default async function Home() {
  // Fetch products automatically before the HTML is even sent to the browser!
  const { data: products } = await getProducts();

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-8 md:p-16 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-800">
              EcomSphere <span className="text-gray-400 font-light text-3xl">React</span>
            </h1>
            <p className="mt-2 text-gray-500 text-lg">Next.js Client fetching from Express API Microservice</p>
          </div>
          <p className="mt-4 md:mt-0 font-semibold text-teal-800 bg-teal-100 px-6 py-2 rounded-full shadow-sm border border-teal-200">
            Phase 4 Architecture
          </p>
        </header>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-20 text-xl font-medium">Failed to connect to Express Backend on Port 3000</div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {products.map((product: any) => (
              <Link href={`/product/${product._id}`} key={product._id} className="group">
                <div 
                  className="bg-white h-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative h-60 w-full bg-gray-50 flex items-center justify-center p-4">
                    {/* Safely parses any image format from the DB */}
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name} 
                      className="object-cover h-full max-h-full group-hover:scale-110 transition-transform duration-500 ease-in-out mix-blend-multiply"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {product.category}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col justify-between whitespace-normal">
                    <div>
                      <div className="flex items-center space-x-1 mb-2">
                         {/* Rating Stars mapped correctly */}
                         {[1,2,3,4,5].map(star => (
                           <svg key={star} className={`w-3.5 h-3.5 ${star <= (product.averageRating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                         ))}
                      </div>
                      <h3 className="text-gray-800 font-bold leading-snug">{product.name}</h3>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Price</p>
                        <p className="text-2xl font-black text-teal-700">₹{product.price}</p>
                      </div>
                      <button className="bg-gray-900 hover:bg-teal-600 text-white w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
