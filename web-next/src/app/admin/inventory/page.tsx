'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchInventory = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Inventory breach detected');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    const token = localStorage.getItem('adminToken');
    setSyncing(id);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ countInStock: newStock }),
      });
      if (res.ok) {
        setProducts(products.map(p => p._id === id ? { ...p, countInStock: newStock } : p));
      }
    } catch (err) {
      console.error('Core sync failed');
    } finally {
      setSyncing(null);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Scanning Stock Clusters...</p>
      </div>
    </div>
  );

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-emerald-400">
           <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Global Supply Chain
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">Stock <span className="text-emerald-400 not-italic">Matrix</span></h1>
        <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-widest text-xs">Real-time inventory equilibrium monitoring</p>
      </header>

      <div className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800/50">
                     <th className="px-6 py-8">SKU Identity</th>
                     <th className="px-6 py-8">Price Point</th>
                     <th className="px-6 py-8">Equilibrium Status</th>
                     <th className="px-6 py-8">Calibration (Stock)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/10">
                  {products.map((p, idx) => (
                    <tr key={idx} className={`group hover:bg-white/[0.02] transition-colors ${p.countInStock <= 5 ? 'bg-rose-500/5' : ''}`}>
                       <td className="px-6 py-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-[2rem] bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
                                <img src={getImageUrl(p.image)} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                             </div>
                             <div>
                                <p className="text-white font-black text-lg tracking-tighter uppercase">{p.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.category}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-8">
                           <span className="text-2xl font-black text-white italic">₹{p.price.toLocaleString()}</span>
                       </td>
                       <td className="px-6 py-8">
                           <span className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                             p.countInStock === 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' : 
                             p.countInStock <= 5 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                             'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                           }`}>
                             {p.countInStock === 0 ? 'Depleted' : p.countInStock <= 5 ? 'Critical-Low' : 'Stable'}
                           </span>
                       </td>
                       <td className="px-6 py-8">
                           <div className="flex items-center gap-4">
                              <input 
                                type="number" 
                                value={p.countInStock} 
                                onChange={(e) => updateStock(p._id, parseInt(e.target.value))}
                                disabled={syncing === p._id}
                                className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black w-32 focus:border-emerald-500 outline-none transition-all"
                              />
                              {syncing === p._id && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
                           </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
