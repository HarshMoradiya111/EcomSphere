'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/src/config';

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: '',
    countInStock: 0,
    description: '',
    brand: '',
    image: [] as string[]
  });

  const categories = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics', 'Accessories'];

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`${API_URL}/api/v1/admin/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setFormData(data.product);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err) {
        setError('Network link failure.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push('/admin/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-12 text-[#64748b] font-bold animate-pulse">Synchronizing metadata...</div>;

  return (
    <div className="admin-content p-[30px] max-w-5xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-[900] text-[#f1f5f9] tracking-tighter italic">
            Edit <span className="text-[#ffd700] not-italic">Inventory SKU</span>
          </h2>
          <p className="text-[#64748b] text-[13px] font-bold uppercase tracking-[2px] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse"></span> {id}
          </p>
        </div>
        <Link href="/admin/products" className="bg-[#1e293b] border border-[#334155] text-[#f1f5f9] px-5 py-2.5 rounded-[12px] text-[13px] font-[700] hover:bg-[#334155] transition-all">
          ← Back
        </Link>
      </div>

      <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[24px] overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-[14px] text-[12px] font-bold uppercase tracking-wider text-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-[900] text-[#64748b] uppercase tracking-[1.5px] ml-1">Product Identity</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-[16px] px-6 py-4 text-[#f1f5f9] font-[700] text-[15px] focus:border-[#ffd700] outline-none transition-all placeholder:text-[#334155]"
                placeholder="Name of asset..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-[900] text-[#64748b] uppercase tracking-[1.5px] ml-1">Market Vertical</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-[16px] px-6 py-4 text-[#f1f5f9] font-[700] text-[14px] focus:border-[#ffd700] outline-none appearance-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-[900] text-[#64748b] uppercase tracking-[1.5px] ml-1">Valuation (₹)</label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-[16px] px-6 py-4 text-[#f1f5f9] font-[700] text-[16px] focus:border-[#ffd700] outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-[900] text-[#64748b] uppercase tracking-[1.5px] ml-1">Inventory Reservoir</label>
              <input 
                required
                type="number" 
                value={formData.countInStock}
                onChange={(e) => setFormData({...formData, countInStock: parseInt(e.target.value)})}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-[16px] px-6 py-4 text-[#f1f5f9] font-[700] text-[16px] focus:border-[#ffd700] outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-[900] text-[#64748b] uppercase tracking-[1.5px] ml-1">Specification Payload</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-[16px] px-6 py-5 text-[#94a3b8] font-[500] text-[14px] focus:border-[#ffd700] outline-none transition-all leading-relaxed"
              placeholder="Enter product deconstruction details..."
            />
          </div>

          <div className="pt-6 flex gap-4">
            <Link 
              href="/admin/products"
              className="px-10 py-4 rounded-[16px] bg-[#0f172a] text-[#64748b] font-bold uppercase text-[12px] tracking-widest hover:text-[#f1f5f9] transition-all border border-[#334155]"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={updating}
              className="flex-1 py-4 rounded-[16px] bg-[#ffd700] text-[#0f172a] font-[900] uppercase text-[13px] tracking-[2px] hover:scale-[1.01] active:scale-95 shadow-[0_10px_25px_-5px_rgba(255,215,0,0.3)] transition-all disabled:opacity-50"
            >
              {updating ? 'Committing Synchronization...' : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
