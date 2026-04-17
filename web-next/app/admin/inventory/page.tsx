'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/src/config';
import { getImageUrl } from '@/src/utils/imagePaths';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchInventory = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (e) {
      console.error('Inventory fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleStockUpdate = async (id: string) => {
    const newStock = stockChanges[id];
    if (newStock === undefined || isNaN(newStock)) return;
    
    setSyncingId(id);
    const token = localStorage.getItem('adminToken');
    
    try {
      console.log(`Syncing Node: ${id} to ${newStock}...`);
      const res = await fetch(`${API_URL}/api/v1/admin/inventory/update-stock/${id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ countInStock: newStock })
      });
      
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map((p) => p._id === id ? { ...p, countInStock: data.newStock, status: data.newStatus } : p));
        setStockChanges(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        console.log(`Node State Committed: ${id}`);
      } else {
        alert(`Sync Error: ${data.error || 'Unknown Fault'}`);
      }
    } catch (e) {
        console.error('Network/IO Link Fault', e);
        alert('Critical Network Failure: Verify Backend Node.');
    } finally {
        setSyncingId(null);
    }
  };

  if (loading) return <div className="p-10 font-black text-[#64748b] tracking-widest uppercase text-[12px]">Initializing Inventory Cluster...</div>;

  return (
    <div className="inventory-page">
      <div className="flex justify-between items-end mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Inventory Control Hub</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-[0.2em]">Real-time Spectral Stock Management</p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-[80px]">Node</th>
              <th>Identity</th>
              <th>Sector</th>
              <th>Valuation</th>
              <th className="w-[150px]">Current Stock</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((product) => {
              const hasChange = stockChanges[product._id] !== undefined;
              const isSyncing = syncingId === product._id;
              
              return (
                <tr key={product._id}>
                  <td className="py-4">
                    <img src={getImageUrl(product.image)} className="product-img-ent" alt="" />
                  </td>
                  <td>
                    <p className="font-bold text-white text-[15px] mb-1">{product.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-black tracking-widest uppercase">ID://{product._id?.slice(-8)}</p>
                  </td>
                  <td><span className="badge-pill">{product.category}</span></td>
                  <td className="font-black text-white">₹{product.price.toLocaleString()}</td>
                  <td>
                    <input 
                      type="number" 
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-md py-2 px-3 text-white font-black text-[14px] text-center focus:border-[var(--accent)] outline-none"
                      value={stockChanges[product._id] ?? product.countInStock} 
                      min="0"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setStockChanges(prev => ({ ...prev, [product._id]: val }));
                      }}
                    />
                  </td>
                  <td>
                    <span className={`badge-pill ${product.countInStock <= 5 ? '!text-[var(--danger)] !border-[var(--danger)]/30' : ''}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button 
                      className={`btn-core !py-2 !px-4 !text-[11px] transition-all ${
                        isSyncing ? '!bg-[var(--accent)] !text-black' : 
                        (hasChange ? 'btn-primary opacity-100' : 'btn-primary opacity-30 cursor-not-allowed')
                      }`}
                      disabled={!hasChange || isSyncing}
                      onClick={() => handleStockUpdate(product._id)}
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Stock'}
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="py-40 text-center">
                  <i className="fa-solid fa-satellite-dish text-4xl text-[var(--surface-raised)] mb-4 block"></i>
                  <p className="text-[var(--text-muted)] uppercase tracking-[4px] text-[12px] font-black">Zero Spectral Assets Located</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
