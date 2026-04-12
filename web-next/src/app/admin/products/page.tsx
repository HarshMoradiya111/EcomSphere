'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  countInStock: number;
  image: string[]; // Or string depending on schema
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('${API_URL}/api/v1/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ultra-resilient SKU resolution node
  const getImageUrl = (image: any) => {
    if (!image) return '${API_URL}/img/placeholder.jpg';
    
    // Support both single string and array structures
    const imgStr = Array.isArray(image) ? image[0] : image;
    
    if (imgStr.startsWith('http')) return imgStr;
    
    // Defensively handle prefixes
    if (imgStr.startsWith('/uploads') || imgStr.startsWith('uploads/')) {
       return `${API_URL}${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
    }
    
    // Seeded assets like n1.jpg are in the root / or /img/
    if (imgStr.includes('/')) return `${API_URL}${imgStr.startsWith('/') ? '' : '/'}${imgStr}`;
    
    // Default fallback to /uploads/ if it's a raw filename from a recent upload
    return `${API_URL}/uploads/${imgStr}`;
  };

  const updateStock = async (id: string, newStock: number) => {
    setSyncing(id);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countInStock: newStock }),
      });
      if (res.ok) {
        setProducts(products.map(p => p._id === id ? { ...p, countInStock: newStock } : p));
      }
    } catch (err) {
      console.error('Stock sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('🚨 Are you absolutely sure? This will wipe the product from the global database.')) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Deletion failed');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a]">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-cyan-400 font-bold tracking-[0.2em] uppercase text-xs">Catalog Indexing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1700px] mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">Control Matrix: <span className="text-cyan-400 not-italic">Inventory</span></h1>
          <p className="text-slate-500 font-medium text-lg uppercase tracking-widest text-[10px]">Real-Time Global Stock synchronization</p>
        </div>
        <div className="flex gap-4">
             <button onClick={fetchProducts} className="p-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-cyan-500 transition-all">🔄</button>
             <Link 
                href="/admin/products/bulk" 
                className="px-8 py-4 bg-slate-900 border border-slate-700 text-slate-400 font-black rounded-2xl hover:border-cyan-500 hover:text-white transition-all uppercase tracking-tight flex items-center gap-2"
            >
                <span>📦</span> Bulk Ingest
            </Link>
             <Link 
                href="/admin/products/new" 
                className="px-8 py-4 bg-cyan-500 text-white font-black rounded-2xl hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all uppercase tracking-tight flex items-center gap-2"
            >
                <span>➕</span> Deploy New SKU
            </Link>
        </div>
      </header>

      <div className="bg-slate-800/20 backdrop-blur-3xl rounded-[3rem] border border-slate-700/40 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/50 bg-slate-900/30">
              <th className="px-8 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Identity</th>
              <th className="px-8 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Category</th>
              <th className="px-8 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Price Point</th>
              <th className="px-8 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Stock Level</th>
              <th className="px-8 py-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] text-right">Operational Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {products.map((p) => (
              <tr key={p._id} className="group hover:bg-white/[0.02] transition-colors relative">
                <td className="px-8 py-10">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                        <img 
                            src={getImageUrl(p.image)} 
                            alt={p.name} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tighter">{p.name}</p>
                        <p className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-widest">{p._id}</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-10">
                   <span className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700/50 text-slate-400 font-bold text-xs uppercase tracking-widest">
                     {p.category}
                   </span>
                </td>
                <td className="px-8 py-10 font-bold text-2xl text-green-400 tracking-tighter">
                  ₹{p.price.toLocaleString()}
                </td>
                <td className="px-8 py-10">
                  <div className="flex items-center gap-4">
                    <input 
                       type="number"
                       value={p.countInStock}
                       onChange={(e) => updateStock(p._id, parseInt(e.target.value))}
                       disabled={syncing === p._id}
                       className="w-20 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-black focus:border-cyan-500 outline-none transition-all disabled:opacity-50"
                    />
                    {p.countInStock <= 5 && (
                        <span className="text-[9px] font-black text-orange-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                          CRITICAL LOW
                        </span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-10 text-right">
                  <div className="flex justify-end gap-3">
                      <div className="flex gap-4">
                          <Link 
                              href={`/admin/products/${p._id}`}
                              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest"
                          >
                              Modify
                          </Link>
                          <button 
                              onClick={() => deleteProduct(p._id)}
                              className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-2xl font-black text-[10px] uppercase tracking-widest"
                          >
                              Purge
                          </button>
                      </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="py-32 text-center">
             <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm animate-pulse">Catalog Zero State</p>
          </div>
        )}
      </div>
    </div>
  );
}
