'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  _id: string;
  user: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: { city: string; country: string };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('${API_URL}/api/v1/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Logistics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`${API_URL}/api/v1/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
    } catch (err) {
      console.error('Status sync failed');
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0f172a]">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="mt-8 text-emerald-400 font-black tracking-widest text-xs uppercase animate-pulse">Scanning Global Shipments...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic">Logistics <span className="text-emerald-400 not-italic">Hub</span></h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px] mt-2 ml-1">Real-Time Order Lifecycle Tracking</p>
        </div>
        <button onClick={fetchOrders} className="p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-emerald-500 transition-all">🔄</button>
      </header>

      <div className="bg-slate-800/10 backdrop-blur-3xl rounded-[3.5rem] border border-slate-700/30 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800">
              <th className="px-10 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Tracking ID</th>
              <th className="px-10 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Destination</th>
              <th className="px-10 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Volume</th>
              <th className="px-10 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Live Status</th>
              <th className="px-10 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Actions</th>
              <th className="px-10 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {orders.map((o) => (
              <tr key={o._id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-10 py-10 font-bold text-slate-400 group-hover:text-emerald-400 transition-colors uppercase tracking-tight text-xs italic">
                  {o._id}
                </td>
                <td className="px-10 py-10">
                   <p className="text-white font-black text-sm uppercase tracking-tighter">
                     {o.shippingAddress?.city || 'HQ'}, {o.shippingAddress?.country || 'India'}
                   </p>
                </td>
                <td className="px-10 py-10 font-black text-slate-100 text-xl">
                  ₹{o.totalAmount.toLocaleString()}
                </td>
                <td className="px-10 py-10">
                   <select 
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      disabled={updating === o._id}
                      className={`px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 font-black text-[10px] uppercase tracking-widest focus:border-emerald-500 outline-none transition-all ${
                        o.status === 'Delivered' ? 'text-emerald-500' : 
                        o.status === 'Cancelled' ? 'text-rose-500' : 'text-orange-500'
                      }`}
                   >
                     <option value="Processing">Processing</option>
                     <option value="Shipped">Shipped</option>
                     <option value="Delivered">Delivered</option>
                     <option value="Cancelled">Cancelled</option>
                   </select>
                </td>
                <td className="px-10 py-10">
                   <Link 
                      href={`/admin/orders/${o._id}`}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                   >
                      🔍 Deep-Dive
                   </Link>
                </td>
                <td className="px-10 py-10 text-slate-500 text-xs font-bold font-mono">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="py-24 text-center">
             <p className="text-slate-600 font-black uppercase tracking-widest text-xs animate-pulse italic">Pipeline Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
