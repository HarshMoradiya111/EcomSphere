'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => { fetchProducts(); }, []);

  if (loading) return <div className="p-8 text-[#94a3b8]">Loading products...</div>;

  return (
    <div className="admin-content">
      <div className="quick-actions flex gap-[12px] p-[25px_30px_20px] flex-wrap">
        <Link href="/admin/products/add" className="admin-btn bg-[#ffd700] text-[#0f172a] inline-flex items-center gap-[6px] p-[9px_16px] rounded-[7px] text-[13px] font-[600] transition-all">
          <i className="fa-solid fa-plus"></i> Add New Product
        </Link>
        <Link href="/admin/products/bulk" className="admin-btn bg-[#334155] text-[#f1f5f9] inline-flex items-center gap-[6px] p-[9px_16px] rounded-[7px] text-[13px] font-[600] border border-[#334155] transition-all">
          <i className="fa-solid fa-upload"></i> Bulk Upload
        </Link>
        <Link href="/admin/products/ai" className="admin-btn bg-[#3b82f6] text-white inline-flex items-center gap-[6px] p-[9px_16px] rounded-[7px] text-[13px] font-[600] transition-all">
          <i className="fa-solid fa-robot"></i> AI Cataloging
        </Link>
      </div>

      <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[12px] m-[0_30px_25px] overflow-hidden">
        <div className="card-header flex items-center justify-between p-[18px_22px] border-b border-[#334155]">
          <h3 className="text-[16px] font-[700] text-[#f1f5f9]">Product Inventory</h3>
        </div>
        <div className="table-responsive w-full overflow-x-auto">
          <table className="admin-table w-full border-collapse">
            <thead>
              <tr className="bg-[#0f172a]">
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Image</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Name</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Category</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Price</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Stock</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/2 border-b border-[#334155]">
                  <td className="p-[14px_16px]">
                    <img src={getImageUrl(p.image)} alt="" className="w-[50px] h-[50px] object-cover rounded-[8px] border border-[#334155]" />
                  </td>
                  <td className="p-[14px_16px] text-[14px] text-[#f1f5f9] font-[500]">{p.name}</td>
                  <td className="p-[14px_16px]">
                    <span className="bg-[rgba(255,215,0,0.1)] text-[#ffd700] p-[4px_10px] rounded-[20px] text-[12px] font-[700]">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-[14px_16px] text-[14px] text-[#f1f5f9]">₹{p.price.toLocaleString()}</td>
                  <td className="p-[14px_16px]">
                    <span className={`text-[14px] font-[700] ${p.countInStock <= 5 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                      {p.countInStock}
                    </span>
                  </td>
                  <td className="p-[14px_16px]">
                    <div className="flex gap-[8px]">
                      <Link href={`/admin/products/edit/${p._id}`} className="p-[6px_10px] bg-[#334155] text-white rounded-[6px] text-[12px] hover:bg-[#475569]">
                        <i className="fa-solid fa-pen"></i>
                      </Link>
                      <button onClick={() => deleteProduct(p._id)} className="p-[6px_10px] bg-[#ef4444] text-white rounded-[6px] text-[12px] hover:bg-[#dc2626]">
                        <i className="fa-solid fa-trash"></i>
                      </button>
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
