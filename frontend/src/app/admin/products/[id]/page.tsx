'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: '',
    description: '',
    countInStock: 0,
    image: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:3000/api/v1/admin/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setFormData(data.product);
        }
      } catch (err) {
        console.error('Core sync failed');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/v1/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('Product Attributes Reconfigured ✅');
        router.push('/admin/products');
      }
    } catch (err) {
      console.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-400 font-black uppercase tracking-widest text-xs">Accessing SKU Meta-Data...</div>;

  return (
    <div className="p-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
      <header className="mb-16">
          <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-indigo-400">
             <span className="w-2 h-2 rounded-full bg-indigo-400"></span> SKU Reconfiguration
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">Edit <span className="text-slate-500">Asset</span></h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Modify core product parameters for global distribution</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-slate-800/10 backdrop-blur-3xl p-12 rounded-[4rem] border border-slate-700/30 space-y-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Identity (Name)</label>
                  <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price Point (INR)</label>
                  <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner font-mono"
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Category</label>
                  <input 
                      type="text" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner"
                  />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Reservoir Level</label>
                  <input 
                      type="number" 
                      value={formData.countInStock}
                      onChange={(e) => setFormData({...formData, countInStock: Number(e.target.value)})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl px-8 py-5 text-white font-bold focus:border-indigo-500 outline-none transition-all shadow-inner font-mono"
                  />
              </div>

              <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Technical Specifications (Description)</label>
                  <textarea 
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-[3rem] px-8 py-6 text-white font-medium focus:border-indigo-500 outline-none transition-all shadow-inner resize-none"
                  />
              </div>
          </div>

          <div className="pt-8 border-t border-slate-800/50 flex justify-end gap-6">
              <button 
                  type="button"
                  onClick={() => router.push('/admin/products')}
                  className="px-10 py-5 bg-slate-800 text-slate-400 font-black rounded-3xl hover:bg-slate-700 transition-all uppercase tracking-tighter"
              >
                  Abort
              </button>
              <button 
                  type="submit"
                  disabled={saving}
                  className="px-12 py-5 bg-indigo-500 text-white font-black rounded-3xl hover:bg-indigo-400 transition-all uppercase tracking-tighter shadow-xl shadow-indigo-500/20 disabled:opacity-50"
              >
                  {saving ? 'Syncing...' : 'Commit Changes'}
              </button>
          </div>
      </form>
    </div>
  );
}
