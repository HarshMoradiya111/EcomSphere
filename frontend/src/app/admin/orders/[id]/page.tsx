'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OrderDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:3000/api/v1/admin/orders/${id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Logistics deep-dive failed');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Protocol-aware SKU image resolution node
  const getImageUrl = (product: any) => {
    if (!product || !product.image) return 'http://127.0.0.1:3000/img/placeholder.jpg';
    
    // In our schema, image is a String (Legacy/Seeded) or could be an Array in some contexts
    const imgStr = Array.isArray(product.image) ? product.image[0] : product.image;
    
    if (imgStr.startsWith('http')) return imgStr;
    
    // Defensively handle prefixes
    if (imgStr.startsWith('/uploads') || imgStr.startsWith('uploads/')) {
       return `http://127.0.0.1:3000${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
    }
    
    // Seeded assets like n1.jpg are in the root / or /img/
    if (imgStr.includes('/')) return `http://127.0.0.1:3000${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
    
    // Default fallback to /uploads/ if it's a raw filename from a recent upload
    return `http://127.0.0.1:3000/uploads/${imgStr}`;
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-rose-400 font-black uppercase tracking-widest text-xs">Accessing Logistics Vault...</div>;
  if (!order) return <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest text-xs">Node Not Found</div>;

  return (
    <div className="p-12 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
      <header className="mb-16 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-rose-400">
               <span className="w-2 h-2 rounded-full bg-rose-400"></span> Logistics Snapshot
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter">Order <span className="text-slate-500">#{order._id.slice(-6)}</span></h1>
            <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-[0.2em] text-xs">Transaction ID: {order._id}</p>
          </div>
          <button 
            onClick={() => router.push('/admin/orders')}
            className="px-8 py-4 bg-slate-800 text-slate-400 font-black rounded-3xl hover:bg-slate-700 transition-all uppercase tracking-tighter text-[10px]"
          >
            &larr; Back to Command
          </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Item Matrix */}
          <div className="lg:col-span-2 space-y-12">
              <div className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 pb-4 border-b border-slate-800/50">Itemized Payload</h2>
                  <div className="space-y-8">
                      {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center group">
                              <div className="flex items-center gap-6">
                                  <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-inner">
                                      <img src={getImageUrl(item.productId)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                                  <div>
                                      <p className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-rose-400 transition-colors">{item.productId?.name || 'Unknown SKU'}</p>
                                      <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-[0.2em]">QTY: {item.quantity} UNITS @ ₹{item.price}</p>
                                  </div>
                              </div>
                              <p className="text-2xl font-black text-white tracking-tighter italic">₹{(item.quantity * item.price).toLocaleString()}</p>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
                   <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 pb-4 border-b border-slate-800/50">Shipping Destination</h2>
                   <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Street Hub</p>
                            <p className="text-white font-bold text-lg">{order.shippingAddress?.street}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Sector (City)</p>
                            <p className="text-white font-bold text-lg">{order.shippingAddress?.city}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Global Zip</p>
                            <p className="text-white font-bold text-lg font-mono tracking-widest uppercase">{order.shippingAddress?.zip}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Access Protocol (Country)</p>
                            <p className="text-white font-bold text-lg">{order.shippingAddress?.country || 'India'}</p>
                        </div>
                   </div>
              </div>
          </div>

          {/* Right Summary */}
          <div className="space-y-12 h-fit sticky top-24">
               <div className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 pb-4 border-b border-slate-800/50">Financial Protocol</h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Value</span>
                            <span className="text-lg font-black text-white italic">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pipeline Fees</span>
                            <span className="text-lg font-black text-green-500 italic">WAIVED</span>
                        </div>
                        <div className="pt-6 border-t border-slate-800/50 flex justify-between items-center">
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Total</span>
                             <span className="text-4xl font-black text-rose-500 tracking-tighter italic">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
               </div>

               <div className={`p-10 rounded-[4rem] border transition-all shadow-2xl ${order.status === 'Processing' ? 'bg-orange-500/10 border-orange-500/30' : order.status === 'Delivered' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                   <h2 className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4">Current Lifecycle Phase</h2>
                   <p className={`text-4xl font-black tracking-tighter italic ${order.status === 'Processing' ? 'text-orange-500' : order.status === 'Delivered' ? 'text-emerald-500' : 'text-rose-500'}`}>{order.status}</p>
                   <p className="text-[10px] font-black opacity-40 mt-6 uppercase tracking-widest">Last Modified: {new Date(order.updatedAt).toLocaleTimeString()}</p>
               </div>
          </div>
      </div>
    </div>
  );
}
