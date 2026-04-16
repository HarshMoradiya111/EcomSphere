import React from 'react';
import Link from 'next/link';
import { API_URL } from '@/config';
import AddToCartButton from '@/features/cart/AddToCartButton';
import { getImageUrl } from '@/utils/imagePaths';

// Automatically securely fetch the specific product from our Express API!
async function getSingleProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return { data: null };
    return res.json();
  } catch (error) {
    return { data: null };
  }
}

// Dynamic Route file automatically injected with the ID from the URL!
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15 (React 19), params is a Promise that must be awaited
  const resolvedParams = await params;
  const { data: product } = await getSingleProduct(resolvedParams.id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <Link href="/" className="px-6 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition">Return to Shop</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-8 md:p-16 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left Side: Product Image Display */}
        <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-12">
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name}
            className="object-cover max-h-[500px] hover:scale-105 transition-transform duration-500 rounded-xl shadow-2xl"
          />
        </div>

        {/* Right Side: Details and Checkout logic */}
        <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
          <span className="text-sm font-bold text-teal-600 tracking-wider uppercase mb-2">
            {product.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {product.name}
          </h1>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex">
              {[1,2,3,4,5].map(star => (
                <svg key={star} className={`w-5 h-5 ${star <= (product.averageRating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              ))}
            </div>
            <span className="text-gray-500 text-sm">({product.numReviews || 0} customer reviews)</span>
          </div>

          <p className="text-4xl font-black text-teal-700 mb-8 border-b border-gray-100 pb-8">
            ₹{product.price}
          </p>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {product.description || "A premium quality item guaranteed to exceed your expectations. Buy now before stock runs out."}
          </p>

          <div className="flex items-center space-x-4">
            <AddToCartButton 
              productId={product._id} 
              productName={product.name} 
              price={product.price}
              image={product.image}
            />
            
            <Link href="/" className="px-6 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-900 hover:text-gray-900 transition-colors">
              Back to Shop
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500 flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span>{product.countInStock > 0 ? `${product.countInStock} items in stock (Ready to ship)` : 'Out of Stock'}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
