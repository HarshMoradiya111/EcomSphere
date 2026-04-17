'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { API_URL } from '@/src/config';
import { getImageUrl } from '@/src/utils/imagePaths';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  countInStock: number;
  image: string[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.warn('Deletion failed');
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => { fetchProducts(); }, []);

  if (loading) return <div className="p-8 text-[#94a3b8] font-bold">Initializing Inventory Cluster...</div>;

  return (
    <div>
      {/* 1. Universal Page Header */}
      <div className="flex justify-between items-end mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Product Inventory</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-[0.2em]">Global Asset Registry & Node Sync</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/ai" className="btn-core" style={{ background: '#6366f1', color: '#fff' }}>
            <i className="fa-solid fa-brain"></i> Neural Assist
          </Link>
          <Link href="/admin/products/bulk" className="btn-core btn-secondary">
            <i className="fa-solid fa-file-import"></i> Bulk Ops
          </Link>
          <Link href="/admin/products/new" className="btn-core btn-primary">
            <i className="fa-solid fa-plus"></i> New Asset
          </Link>
        </div>
      </div>

      {/* 2. Professional Control Strip */}
      <div className="control-strip">
        <div className="flex-1 flex items-center gap-3">
          <i className="fa-solid fa-search text-[14px] text-[var(--text-muted)]"></i>
          <input 
            type="text" 
            placeholder="FILTER BY IDENTITY OR SKU..."
            className="flex-1 bg-transparent border-none text-[13px] text-white outline-none font-bold uppercase tracking-wider placeholder:opacity-20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-4 w-[1px] bg-[var(--border)] mx-2"></div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Sector</span>
          <select 
            className="bg-transparent border-none text-[13px] text-white font-black outline-none cursor-pointer pr-4 uppercase tracking-tighter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-[var(--surface-raised)]">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Enterprise Data Grid */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-[100px]">Asset</th>
              <th>Identity</th>
              <th>Sector</th>
              <th>Valuation</th>
              <th>Node Integrity</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? filteredProducts.map((p) => (
              <tr key={p._id}>
                <td className="py-4">
                  <img src={getImageUrl(p.image)} alt="" className="product-img-ent" />
                </td>
                <td>
                  <p className="font-bold text-white text-[15px] leading-tight mb-1">{p.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-black tracking-widest uppercase">ID://{p._id?.slice(-10) || 'ARCHIVED'}</p>
                </td>
                <td>
                  <span className="badge-pill">{p.category}</span>
                </td>
                <td>
                  <span className="font-black text-white text-[16px] tracking-tighter">₹{p.price.toLocaleString()}</span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${p.countInStock <= 5 ? 'bg-[var(--danger)]' : 'bg-[var(--success)]'}`}
                        style={{ width: `${Math.min(100, (p.countInStock / 100) * 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-[12px] font-black ${p.countInStock <= 5 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>{p.countInStock}</span>
                  </div>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/edit/${p._id}`} className="w-9 h-9 flex items-center justify-center rounded border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                      <i className="fa-solid fa-pen-nib text-[14px]"></i>
                    </Link>
                    <button onClick={() => deleteProduct(p._id)} className="w-9 h-9 flex items-center justify-center rounded border border-[var(--border)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition-all">
                      <i className="fa-solid fa-trash-can text-[14px]"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-40 text-center">
                  <i className="fa-solid fa-satellite-dish text-4xl text-[var(--surface-raised)] mb-4"></i>
                  <p className="text-[var(--text-muted)] uppercase tracking-[4px] text-[12px] font-black">Zero Matching Nodes Identified</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
