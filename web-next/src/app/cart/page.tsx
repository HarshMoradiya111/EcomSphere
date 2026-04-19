'use client';

import { useEffect, useMemo, useState } from 'react';
import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import { API_URL } from '@/config';
import Link from 'next/link';

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  subtotal: number;
};

type CartResponse = {
  success: boolean;
  cart: CartItem[];
  total: number;
  discountAmount?: number;
  appliedCoupon?: string | null;
  error?: string;
};

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCart() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/cart`, { credentials: 'include' });
      if (response.redirected) {
        window.location.href = '/auth/login';
        return;
      }
      const data = (await response.json()) as CartResponse;
      if (data.success) {
        setCart(data.cart || []);
        setTotal(data.total || 0);
        setDiscountAmount(data.discountAmount || 0);
        setAppliedCoupon(data.appliedCoupon || null);
      } else {
        setError(data.error || 'Failed to fetch cart');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCart();
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  async function updateCartItem(itemId: string, action: 'increase' | 'decrease') {
    try {
      const response = await fetch(`${API_URL}/api/cart/update`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action }),
      });
      const data = await response.json();
      if (data.success) {
        await loadCart();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function removeCartItem(itemId: string) {
    try {
      const response = await fetch(`${API_URL}/api/cart/remove`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await response.json();
      if (data.success) {
        await loadCart();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    try {
      const response = await fetch(`${API_URL}/api/cart/coupon/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setCouponCode('');
        await loadCart();
      } else {
        setError(data.error || 'Invalid coupon');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function removeCoupon() {
    try {
      await fetch(`${API_URL}/api/cart/coupon/remove`, { method: 'POST', credentials: 'include' });
      await loadCart();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <StorefrontShell
      header={{ activePage: 'cart' }}
      breadcrumbs={[{ name: 'Shopping Bag', url: '/cart' }]}
      errors={error ? [error] : []}
    >
      <main className="px-4 py-8 md:px-20 md:py-16 bg-gray-50/30 min-h-[60vh]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* CART ITEMS SECTION */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                   <h2 className="text-xl font-black text-gray-900">My Cart ({cart.length})</h2>
                   <Link href="/shop" className="text-sm font-bold text-[#088178] hover:underline">Continue Shopping</Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {loading ? (
                    <div className="p-20 text-center text-gray-400 font-medium">Updating bag...</div>
                  ) : cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.id} className="p-4 md:p-6 flex gap-4 md:gap-6 group">
                        {/* Image */}
                        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                           <img
                            src={`/uploads/${item.image}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={item.name}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/img/placeholder.jpg'; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                               <h3 className="font-bold text-gray-900 text-sm md:text-lg line-clamp-1">{item.name}</h3>
                               <button 
                                 onClick={() => void removeCartItem(item.id)}
                                 className="text-gray-300 hover:text-red-500 transition-colors p-1"
                               >
                                 <i className="fa-solid fa-trash-can"></i>
                               </button>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs md:text-sm text-gray-500 mb-2">
                               {item.size && <span>Size: <strong className="text-gray-900">{item.size}</strong></span>}
                               {item.color && <span>Color: <strong className="text-gray-900">{item.color}</strong></span>}
                            </div>
                            <div className="text-lg font-black text-[#088178] mb-4">
                               {formatPrice(item.price)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                             {/* Quantity Toggle */}
                             <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9">
                                <button 
                                  onClick={() => void updateCartItem(item.id, 'decrease')}
                                  className="px-3 hover:bg-gray-50 text-gray-500 disabled:opacity-30"
                                  disabled={item.quantity <= 1}
                                >
                                  <i className="fa-solid fa-minus text-[10px]"></i>
                                </button>
                                <span className="px-3 font-bold text-sm min-w-[30px] text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => void updateCartItem(item.id, 'increase')}
                                  className="px-3 hover:bg-gray-50 text-gray-500"
                                >
                                  <i className="fa-solid fa-plus text-[10px]"></i>
                                </button>
                             </div>
                             <div className="text-sm font-bold text-gray-900">
                                Total: {formatPrice(item.price * item.quantity)}
                             </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center">
                       <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-[#088178] mb-6">
                         <i className="fa-solid fa-cart-shopping text-3xl"></i>
                       </div>
                       <h3 className="text-xl font-black text-gray-900 mb-2">Your cart is lonely</h3>
                       <p className="text-gray-500 mb-8">Add something amazing to make it happy!</p>
                       <Link href="/shop" className="bg-[#088178] text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-teal-100">
                         Start Shopping
                       </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SUMMARY SECTION */}
            <div className="w-full lg:w-96 space-y-6">
              {/* Coupon */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <i className="fa-solid fa-tag text-[#088178]"></i> Apply Coupon
                 </h4>
                 <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-gray-50 border-none rounded-lg text-sm px-4 focus:ring-2 focus:ring-[#088178]"
                    />
                    <button 
                      onClick={() => void applyCoupon()}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all"
                    >
                      Apply
                    </button>
                 </div>
                 {appliedCoupon && (
                   <div className="mt-3 flex items-center justify-between bg-teal-50 px-3 py-2 rounded-md">
                      <span className="text-xs font-bold text-[#088178] uppercase">{appliedCoupon} Applied!</span>
                      <button onClick={() => void removeCoupon()} className="text-red-400 hover:text-red-600">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                   </div>
                 )}
              </div>

              {/* Totals */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h4 className="font-bold text-gray-900 mb-6">Order Summary</h4>
                 <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-gray-500 font-medium">
                       <span>Bag Total</span>
                       <span className="text-gray-900 font-bold">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#088178] font-bold">
                         <span>Bag Discount</span>
                         <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500 font-medium">
                       <span>Shipping Fee</span>
                       <span className="text-green-600 font-bold uppercase text-[10px] bg-green-50 px-2 py-0.5 rounded">Free</span>
                    </div>
                    <div className="h-[1px] bg-gray-50 my-2"></div>
                    <div className="flex justify-between text-lg font-black text-gray-900 pt-2">
                       <span>Total Payable</span>
                       <span>{formatPrice(total)}</span>
                    </div>
                 </div>

                 <div className="mt-8 hidden md:block">
                    <Link href="/checkout">
                      <button 
                        disabled={cart.length === 0}
                        className="w-full bg-[#088178] text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-teal-50 hover:bg-[#06665f] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Checkout Now
                      </button>
                    </Link>
                    <p className="text-[10px] text-gray-400 text-center mt-4 font-medium px-4">
                      By clicking checkout, you agree to our terms and conditions.
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY CHECKOUT (Flipkart Style) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-white border-t border-gray-100 z-[999] px-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
         <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Payable</span>
            <span className="text-xl font-black text-gray-900">{formatPrice(total)}</span>
         </div>
         <Link href="/checkout">
           <button 
             disabled={cart.length === 0}
             className="bg-[#088178] text-white px-8 h-12 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-teal-50 active:scale-95 transition-all disabled:opacity-50"
           >
             Place Order
           </button>
         </Link>
      </div>

      {/* MOBILE SPACER */}
      <div className="md:hidden h-20"></div>
    </StorefrontShell>
  );
}
