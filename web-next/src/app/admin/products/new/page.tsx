'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
     name: '',
     price: 0,
     category: 'Men Clothing',
     countInStock: 0,
     description: '',
     brand: '',
     image: 'http://localhost:3000/img/products/1.jpg' // Default link for now
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3000/api/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push('/admin/products');
      }
    } catch (err) {
      console.error('Failed to create SKU');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      <header className="mb-12">
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-cyan-400">
             <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Deployment Terminal
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic">Provision <span className="text-cyan-400 not-italic">New SKU</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Initialize a new product across the global EcomSphere network</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity: Name</label>
                  <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-black text-xl focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                      placeholder="Product Name..."
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Vertical</label>
                  <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full h-[70px] bg-slate-900/50 border border-slate-800 rounded-3xl px-8 text-white font-black uppercase text-xs tracking-widest focus:border-cyan-500 outline-none appearance-none transition-all"
                  >
                     <option>Men Clothing</option>
                     <option>Women Clothing</option>
                     <option>Footwear</option>
                     <option>Glasses</option>
                     <option>Cosmetics</option>
                  </select>
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Financial: Price Point (₹)</label>
                  <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-black text-xl focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Reservoir: Count</label>
                  <input 
                      required
                      type="number" 
                      value={formData.countInStock}
                      onChange={(e) => setFormData({...formData, countInStock: parseInt(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-black text-xl focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                  />
              </div>
          </div>

          <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Technical: Description Payload</label>
              <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-6 text-slate-300 font-medium focus:border-cyan-500 outline-none transition-all"
                  placeholder="Summarize product features and specifications..."
              />
          </div>

          <div className="flex gap-4 pt-12">
              <button 
                  type="button"
                  onClick={() => router.back()}
                  className="px-10 py-5 rounded-[2rem] border border-slate-800 bg-slate-900/30 text-white font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
              >
                  Abort
              </button>
              <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-5 rounded-[2rem] bg-cyan-500 text-white font-black uppercase text-xs tracking-widest hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                  {loading ? 'Committing to Global Cluster...' : 'Initialize Deployment'}
              </button>
          </div>
      </form>
    </div>
  );
}
