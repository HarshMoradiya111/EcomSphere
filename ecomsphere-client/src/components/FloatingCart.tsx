'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingCart() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Super-fast reactive memory hook to check storage
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('react_cart') || '[]');
      setCount(cart.length);
    };
    
    updateCount(); // Initial Check
    
    // Simulate React Context/Redux global state polling
    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hide the floating cart button if we are currently inside the actual Cart Page
  if (pathname === '/cart') return null;

  return (
    <Link 
      href="/cart" 
      className="fixed bottom-10 right-10 bg-teal-600 text-white p-4 rounded-full shadow-2xl hover:bg-teal-700 hover:scale-110 hover:-translate-y-2 transition-all duration-300 flex items-center justify-center z-50 border-4 border-white group"
    >
      <span className="text-3xl pr-2 filter drop-shadow-md">🛒</span>
      <span className="bg-white text-teal-800 font-black text-xl rounded-full w-8 h-8 flex items-center justify-center shadow-inner group-hover:bg-yellow-300 transition-colors">
        {count}
      </span>
    </Link>
  );
}
