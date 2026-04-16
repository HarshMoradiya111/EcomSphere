'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';
import { useAICatalogStore } from '@/store/aiCatalogStore';
import { getImageUrl } from '@/utils/imagePaths';

export default function AIReviewPage() {
  const router = useRouter();
  const { pendingProducts, categories, setPendingProducts, clear } = useAICatalogStore();
  const [products, setProducts] = useState(pendingProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if no products in store (e.g. refresh)
  useEffect(() => {
    if (pendingProducts.length === 0) {
      router.push('/admin/products/ai');
    }
  }, [pendingProducts, router]);

  const handleUpdate = (index: number, field: string, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/products/save-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ products }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        clear();
        setTimeout(() => router.push('/admin/products'), 2000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-10 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/50">
          <span className="text-4xl text-slate-950 font-black">✓</span>
        </div>
        <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter">Mission <span className="text-cyan-400 not-italic">Accomplished</span></h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs mt-4">Intelligence successfully integrated into core catalog</p>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-[1400px] mx-auto min-h-screen pb-40">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-cyan-400 font-black uppercase tracking-widest text-[10px] mb-2 block">Step 02: Verification</span>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">
            Review <span className="text-cyan-400 not-italic">Catalog</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-widest text-xs">
             Verifying {products.length} Neural Identifications
          </p>
        </div>
        <button 
           onClick={() => { clear(); router.push('/admin/products/ai'); }}
           className="px-8 py-3 rounded-full border border-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all"
        >
          Discard Batch
        </button>
      </header>

      <div className="space-y-6">
        {products.map((product, idx) => (
          <div 
            key={idx} 
            className="group relative bg-[#1a2235]/40 backdrop-blur-3xl border border-slate-800/50 rounded-[3rem] p-8 flex flex-col md:flex-row gap-10 hover:border-cyan-500/30 transition-all duration-500"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="w-full md:w-64 h-64 rounded-[2rem] overflow-hidden border-2 border-slate-800 shrink-0 shadow-2xl">
              <img 
                src={getImageUrl(product.tempImage)} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt="Product" 
              />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
               <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 px-1">Identity Label</label>
                  <input 
                    type="text" 
                    value={product.name}
                    onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all shadow-inner"
                  />
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 px-1">Category Classification</label>
                  <select 
                    value={product.category}
                    onChange={(e) => handleUpdate(idx, 'category', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all appearance-none"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 px-1">Market Valuation (INR)</label>
                  <input 
                    type="number" 
                    value={product.price}
                    onChange={(e) => handleUpdate(idx, 'price', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all"
                  />
               </div>

               <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 px-1">Marketing Synthesis (Description)</label>
                  <textarea 
                    value={product.description}
                    onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-slate-400 text-sm leading-relaxed outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all resize-none"
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full px-10 py-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <div className="hidden md:block">
              <p className="text-white font-black uppercase text-xs tracking-tighter">Ready for deployment?</p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Direct bridge to shop database active</p>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-cyan-500 text-slate-950 px-12 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:bg-slate-800 disabled:text-slate-600"
           >
             {isSaving ? 'INTEGRATING...' : `Commit ${products.length} Units to Catalog`}
           </button>
        </div>
      </div>
    </div>
  );
}
