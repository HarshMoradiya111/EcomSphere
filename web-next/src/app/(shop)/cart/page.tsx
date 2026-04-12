'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Safe image parser replicating backend
function getImageUrl(image: any) {
  if (!image) return '${API_URL}/img/placeholder.jpg';
  const imgStr = Array.isArray(image) ? image[0] : image;
  if (imgStr.startsWith('http')) return imgStr;
  if (imgStr.includes('/')) return `${API_URL}${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
  return `${API_URL}/uploads/${imgStr}`;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    // When the component paints onto the browser, securely read local memory!
    const savedCart = JSON.parse(localStorage.getItem('react_cart') || '[]');
    setCartItems(savedCart);

    // Run the Math
    const total = savedCart.reduce((sum: number, item: any) => sum + item.price, 0);
    setSubtotal(total);
  }, []);

  const clearCart = () => {
    localStorage.removeItem('react_cart');
    setCartItems([]);
    setSubtotal(0);
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-8 md:p-16 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-10 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-teal-800">Your React Cart</h1>
            <p className="mt-2 text-gray-500">Items saved independently in the Next.js Browser State</p>
          </div>
          <Link href="/" className="text-teal-600 font-bold hover:underline">
            &larr; Continue Shopping
          </Link>
        </header>

        {cartItems.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Cart is Empty</h2>
            <Link href="/" className="px-8 py-3 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition">Browse Products</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
            
            {/* Cart Items List */}
            <div className="md:w-2/3 p-8 border-r border-gray-100">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                  <img 
                    src={getImageUrl(item.image)} 
                    className="w-24 h-24 object-cover rounded-xl shadow-sm"
                  />
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                    <p className="text-teal-600 font-bold mt-1">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Math Box */}
            <div className="md:w-1/3 p-8 bg-gray-50">
              <h3 className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-bold text-gray-400 font-mono">React Demo</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-green-500">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-200 pt-6 mb-8">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-3xl font-black text-teal-700">₹{subtotal}</span>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-gray-900 hover:bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 mb-4 flex justify-center items-center"
              >
                Secure Checkout
              </Link>
              <button onClick={clearCart} className="w-full text-red-500 font-bold py-2 hover:bg-red-50 rounded-xl transition">
                Clear React Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
