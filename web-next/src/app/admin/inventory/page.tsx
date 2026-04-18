'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';

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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Initializing Inventory Cluster...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Inventory Control Hub</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Real-time Spectral Stock Management</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4" style={{ width: '80px' }}>Node</th>
                  <th>Identity</th>
                  <th>Sector</th>
                  <th>Valuation</th>
                  <th style={{ width: '150px' }}>Current Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map((product) => {
                  const hasChange = stockChanges[product._id] !== undefined;
                  const isSyncing = syncingId === product._id;
                  
                  return (
                    <tr key={product._id}>
                      <td className="ps-4 py-3">
                        <img src={getImageUrl(product.image)} className="img-thumbnail rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} alt="" />
                      </td>
                      <td>
                        <p className="fw-bold text-dark mb-0" style={{ fontSize: '15px' }}>{product.name}</p>
                        <p className="text-muted small font-monospace fw-bold text-uppercase mb-0" style={{ fontSize: '10px', letterSpacing: '1px' }}>ID://{product._id?.slice(-8)}</p>
                      </td>
                      <td><span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 text-uppercase">{product.category}</span></td>
                      <td className="fw-bold text-dark font-monospace">₹{product.price.toLocaleString()}</td>
                      <td>
                        <input 
                          type="number" 
                          className="form-control form-control-sm text-center fw-bold font-monospace shadow-none"
                          value={stockChanges[product._id] ?? product.countInStock} 
                          min="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setStockChanges(prev => ({ ...prev, [product._id]: val }));
                          }}
                        />
                      </td>
                      <td>
                        <span className={`badge px-2 py-1 border text-uppercase ${product.countInStock <= 5 ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25' : 'bg-success bg-opacity-10 text-success border-success border-opacity-25'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          className={`btn btn-sm text-uppercase fw-bold ${
                            isSyncing ? 'btn-warning' : 
                            (hasChange ? 'btn-primary' : 'btn-outline-secondary opacity-50')
                          }`}
                          style={{ fontSize: '11px', padding: '4px 12px', letterSpacing: '1px' }}
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
                    <td colSpan={7} className="py-5 text-center text-muted">
                      <i className="fa-solid fa-satellite-dish fs-2 mb-3 opacity-50 block"></i>
                      <p className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '12px' }}>Zero Spectral Assets Located</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
