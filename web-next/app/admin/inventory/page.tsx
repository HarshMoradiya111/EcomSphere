'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/src/config';
import { getImageUrl } from '@/src/utils/imagePaths';

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
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.warn('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    const token = localStorage.getItem('adminToken');
    setSyncing(id);
    try {
      await fetch(`${API_URL}/api/v1/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ countInStock: newStock }),
      });
      setProducts(products.map(p => p._id === id ? { ...p, countInStock: newStock } : p));
    } catch (err) {
      alert('Stock update failed');
    } finally {
      setSyncing(null);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  if (loading) return <div className="p-8 text-[#94a3b8]">Loading inventory...</div>;

  return (
    <div className="admin-content">
      <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[12px] m-[25px_30px] overflow-hidden">
        <div className="card-header flex items-center justify-between p-[18px_22px] border-b border-[#334155]">
          <h3 className="text-[16px] font-[700] text-[#f1f5f9]">Inventory Management</h3>
          <button onClick={fetchInventory} className="text-[#ffd700] text-[13px] font-[600]">
            <i className="fa-solid fa-sync"></i> Refresh Stock
          </button>
        </div>
        <div className="table-responsive w-full overflow-x-auto">
          <table className="admin-table w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#0f172a]">
                <th className="text-[#ffd700] p-[14px_16px] font-[600] text-[12px] uppercase tracking-[0.5px]">Product</th>
                <th className="text-[#ffd700] p-[14px_16px] font-[600] text-[12px] uppercase tracking-[0.5px]">Category</th>
                <th className="text-[#ffd700] p-[14px_16px] font-[600] text-[12px] uppercase tracking-[0.5px]">Price</th>
                <th className="text-[#ffd700] p-[14px_16px] font-[600] text-[12px] uppercase tracking-[0.5px]">Status</th>
                <th className="text-[#ffd700] p-[14px_16px] font-[600] text-[12px] uppercase tracking-[0.5px]">Stock Control</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={idx} className={`hover:bg-white/2 border-b border-[#334155] ${p.countInStock <= 5 ? 'bg-[rgba(239,68,68,0.05)]' : ''}`}>
                  <td className="p-[14px_16px]">
                    <div className="flex items-center gap-[12px]">
                      <img src={getImageUrl(p.image)} className="w-[45px] h-[45px] object-cover rounded-[8px] border border-[#334155]" alt="" />
                      <span className="text-[14px] font-[600] text-[#f1f5f9]">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-[14px_16px] text-[13px] text-[#94a3b8]">{p.category}</td>
                  <td className="p-[14px_16px] text-[14px] text-[#f1f5f9] font-[500]">₹{p.price.toLocaleString()}</td>
                  <td className="p-[14px_16px]">
                    <span className={`p-[4px_10px] rounded-[20px] text-[11px] font-[800] uppercase tracking-wider ${
                      p.countInStock === 0 ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]' : 
                      p.countInStock <= 5 ? 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]' :
                      'bg-[rgba(34,197,94,0.1)] text-[#22c55e]'
                    }`}>
                      {p.countInStock === 0 ? 'Out of Stock' : p.countInStock <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="p-[14px_16px]">
                    <div className="flex items-center gap-[10px]">
                      <input 
                        type="number" 
                        value={p.countInStock} 
                        onChange={(e) => updateStock(p._id, parseInt(e.target.value) || 0)}
                        disabled={syncing === p._id}
                        className="bg-[#0f172a] border border-[#334155] rounded-[6px] px-[10px] py-[6px] text-white font-[700] w-20 outline-none focus:border-[#ffd700] transition-all"
                      />
                      {syncing === p._id && <i className="fa-solid fa-spinner fa-spin text-[#ffd700]"></i>}
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
