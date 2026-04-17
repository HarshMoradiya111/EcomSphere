'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/src/config';
import { useAICatalogStore } from '@/src/store/aiCatalogStore';
import { getImageUrl } from '@/src/utils/imagePaths';

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
    } else {
      setProducts(pendingProducts);
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
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-10 animate-in zoom-in duration-500 bg-[#0f172a]">
        <div className="w-24 h-24 bg-[#ffd700] rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,215,0,0.5)]">
          <i className="fa-solid fa-check text-4xl text-[#0f172a]"></i>
        </div>
        <h1 className="text-6xl font-[900] text-[#f1f5f9] italic uppercase tracking-tighter">Mission <span className="text-[#ffd700] not-italic">Accomplished</span></h1>
        <p className="text-[#64748b] font-bold uppercase tracking-[0.4em] text-[12px] mt-4 italic">Neural intelligence integrated into core catalog</p>
      </div>
    );
  }

  return (
    <div className="admin-content p-[30px] max-w-[1400px] mx-auto min-h-screen pb-40">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-[#ffd700] font-[900] uppercase tracking-[2px] text-[11px] mb-2 block">Step 02: Neural Verification</span>
          <h1 className="text-6xl font-[900] text-[#f1f5f9] tracking-tighter uppercase italic">
            Review <span className="text-[#ffd700] not-italic">Synthesis</span>
          </h1>
          <p className="text-[#64748b] font-bold text-[14px] mt-2 uppercase tracking-[2px]">
             Auditing {products.length} Neural Spectral Identifications
          </p>
        </div>
        <button 
           onClick={() => { clear(); router.push('/admin/products/ai'); }}
           className="px-8 py-3 rounded-[16px] border border-[#334155] text-[#64748b] font-bold uppercase tracking-widest text-[11px] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/50 transition-all"
        >
          Discard Batch
        </button>
      </header>

      <div className="space-y-8">
        {products.map((product, idx) => (
          <div 
            key={idx} 
            className="group relative bg-[#1e293b]/50 backdrop-blur-3xl border border-[#334155] rounded-[40px] p-10 flex flex-col md:flex-row gap-12 hover:border-[#ffd700]/30 transition-all duration-500 shadow-xl"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="w-full md:w-72 h-72 rounded-[32px] overflow-hidden border-2 border-[#334155] shrink-0 shadow-2xl relative">
              <img 
                src={getImageUrl(product.tempImage)} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt="Product" 
              />
              <div className="absolute top-4 right-4 bg-[#ffd700] text-[#0f172a] font-[900] text-[10px] px-3 py-1 rounded-full uppercase tracking-widest italic">Asset Verified</div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               <div className="md:col-span-2">
                  <label className="block text-[11px] font-[900] text-[#64748b] uppercase tracking-[2px] mb-3 px-1">Identity Label</label>
                  <input 
                    type="text" 
                    value={product.name}
                    onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-[20px] px-8 py-5 text-[#f1f5f9] font-bold text-[16px] outline-none focus:border-[#ffd700] focus:shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all"
                  />
               </div>

               <div>
                  <label className="block text-[11px] font-[900] text-[#64748b] uppercase tracking-[2px] mb-3 px-1">Category Classification</label>
                  <div className="relative">
                    <select 
                      value={product.category}
                      onChange={(e) => handleUpdate(idx, 'category', e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-[20px] px-8 py-5 text-[#f1f5f9] font-bold text-[14px] outline-none focus:border-[#ffd700] transition-all appearance-none"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"></i>
                  </div>
               </div>

               <div>
                  <label className="block text-[11px] font-[900] text-[#64748b] uppercase tracking-[2px] mb-3 px-1">Valuation Threshold (INR)</label>
                  <input 
                    type="number" 
                    value={product.price}
                    onChange={(e) => handleUpdate(idx, 'price', e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-[20px] px-8 py-5 text-[#f1f5f9] font-black text-[18px] font-mono outline-none focus:border-[#ffd700] transition-all"
                  />
               </div>

               <div className="md:col-span-2">
                  <label className="block text-[11px] font-[900] text-[#64748b] uppercase tracking-[2px] mb-3 px-1">Neural Synthesis (Description)</label>
                  <textarea 
                    value={product.description}
                    onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                    rows={4}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-[24px] px-8 py-6 text-[#94a3b8] text-[14px] leading-relaxed font-medium outline-none focus:border-[#ffd700] transition-all resize-none shadow-inner"
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40">
        <div className="bg-[#1e293b]/80 backdrop-blur-3xl border border-[#334155] rounded-[32px] px-12 py-8 flex items-center justify-between shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
           <div className="hidden md:block">
              <p className="text-[#f1f5f9] font-[900] uppercase text-[14px] tracking-tight">Final verification required.</p>
              <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-[2.5px] leading-none mt-1">Direct bridge to inventory cluster active</p>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-[#ffd700] text-[#0f172a] px-14 py-5 rounded-[20px] font-[900] uppercase tracking-[3px] text-[14px] hover:scale-[1.05] active:scale-95 transition-all shadow-[0_15px_35px_-5px_rgba(255,215,0,0.4)] disabled:bg-[#1e293b] disabled:text-[#334155] disabled:shadow-none"
           >
             {isSaving ? 'INTEGRATING...' : `Deploy ${products.length} Units`}
           </button>
        </div>
      </div>
    </div>
  );
}
