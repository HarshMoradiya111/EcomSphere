'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';


export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    zip: '',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('react_cart') || '[]');
    if (savedCart.length === 0) router.push('/');
    setCart(savedCart);
  }, [router]);

  const total = cart.reduce((sum: number, item: any) => sum + item.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.map((i: any) => ({ productId: i.productId, quantity: 1, price: i.price })),

        shippingAddress: {
           street: formData.street,
           city: formData.city,
           zip: formData.zip,
           country: 'India'
        },
        totalAmount: total,
        paymentMethod: formData.paymentMethod
      };

      const res = await fetch(`${API_URL}/api/v1/orders`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        localStorage.removeItem('react_cart');
        alert('Order Placed Successfully! Generating Tracking ID...');
        router.push('/');
      }
    } catch (err) {
      console.error('Core sync failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-12 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
              <header className="mb-12">
                  <h1 className="text-5xl font-black text-gray-950 tracking-tighter italic">Final <span className="text-gray-300 not-italic">Step.</span></h1>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Logistics Synchronization</p>
              </header>

              <form onSubmit={handleCheckout} className="space-y-8">
                  <div className="space-y-6">
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">01. Destination Details</h2>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2">
                             <input 
                                required
                                type="text" 
                                placeholder="Street Address" 
                                value={formData.street}
                                onChange={(e) => setFormData({...formData, street: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm outline-none focus:border-teal-600 transition-all font-bold"
                             />
                          </div>
                          <input 
                             required
                             type="text" 
                             placeholder="City" 
                             value={formData.city}
                             onChange={(e) => setFormData({...formData, city: e.target.value})}
                             className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm outline-none focus:border-teal-600 transition-all font-bold"
                          />
                          <input 
                             required
                             type="text" 
                             placeholder="Pincode" 
                             value={formData.zip}
                             onChange={(e) => setFormData({...formData, zip: e.target.value})}
                             className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm outline-none focus:border-teal-600 transition-all font-bold font-mono"
                          />
                      </div>
                  </div>

                  <div className="space-y-6 pt-12">
                      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">02. Settlement Pipeline</h2>
                      <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, paymentMethod: 'COD'})}
                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${formData.paymentMethod === 'COD' ? 'bg-teal-950 text-white border-teal-950' : 'bg-white text-gray-400 border-gray-200'}`}
                          >
                            Cash on Delivery
                          </button>
                          <button 
                            type="button" 
                            disabled
                            className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-300 font-black text-[10px] uppercase tracking-widest border border-gray-100 cursor-not-allowed"
                          >
                            Online (Encrypted)
                          </button>
                      </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-6 mt-12 bg-teal-600 text-white font-black rounded-3xl hover:bg-teal-950 transition-all uppercase tracking-widest text-xs shadow-2xl shadow-teal-600/30 disabled:opacity-50"
                  >
                    {loading ? 'Processing Transaction...' : `Finalize Order • ₹${total}`}
                  </button>
              </form>
          </div>

          <div className="lg:w-80 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl h-fit sticky top-24">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8 pb-4 border-b border-gray-50">Cluster Summary</h2>
              <div className="space-y-6 max-h-80 overflow-y-auto pr-2 pb-6 custom-scrollbar">
                  {cart.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4">

                          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                             <img src={item.image} className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <p className="text-[10px] font-black uppercase leading-tight line-clamp-1">{item.name}</p>
                              <p className="text-teal-600 text-[10px] font-black mt-1 font-mono">₹{item.price}</p>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Global Charge</span>
                      <span className="text-xl font-black text-gray-950 tracking-tighter italic">₹{total}</span>
                  </div>
                  <p className="text-[9px] text-gray-400 italic">Inclusive of GST & Sensor Fees</p>
              </div>
          </div>
      </div>
    </div>
  );
}
