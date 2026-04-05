'use client';

import React, { useState } from 'react';

export default function AddToCartButton({ 
  productId, productName, price, image 
}: { 
  productId: string, productName: string, price: number, image: string 
}) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = () => {
    setLoading(true);
    
    // Simulate slight network delay
    setTimeout(() => {
      // 1. Get existing cart from browser storage
      const existingCart = JSON.parse(localStorage.getItem('react_cart') || '[]');
      
      // 2. Add the new item
      existingCart.push({ id: productId, name: productName, price, image });
      
      // 3. Save it back to storage
      localStorage.setItem('react_cart', JSON.stringify(existingCart));
      
      setLoading(false);
      setAdded(true);
      
      alert(`🛒 ${productName} successfully added to your React Cart!`);
      setTimeout(() => setAdded(false), 3000);
    }, 400);
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={loading || added}
      className={`flex-1 font-bold text-lg py-4 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all transform hover:-translate-y-1 
        ${added 
          ? 'bg-green-500 text-white cursor-default' 
          : 'bg-gray-900 hover:bg-teal-600 text-white'
        }
        ${loading ? 'opacity-70' : ''}`}
    >
      {loading ? 'Processing...' : added ? '✅ Added to Cart!' : 'Add to Cart'}
    </button>
  );
}
