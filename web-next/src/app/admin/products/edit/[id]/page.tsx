'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config';

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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Synchronizing metadata...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Modify Asset</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>ID://{id}</p>
        </div>
        <Link href="/admin/products" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
          <i className="fa-solid fa-arrow-left"></i> Back to Inventory
        </Link>
      </div>

      <div className="card shadow-sm border-0 mb-4" style={{ maxWidth: '900px' }}>
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
           <h3 className="fs-6 fw-bold text-dark text-uppercase tracking-widest mb-0">Specification Payload</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4 fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
              </div>
            )}

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Asset Identity</label>
                <input 
                  required
                  type="text" 
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Name of asset..."
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Market Vertical</label>
                <select 
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Valuation (₹)</label>
                <input 
                  required
                  type="number" 
                  className="form-control font-monospace"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Inventory Reservoir</label>
                <input 
                  required
                  type="number" 
                  className="form-control font-monospace"
                  value={formData.countInStock}
                  onChange={(e) => setFormData({...formData, countInStock: parseInt(e.target.value)})}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Spectral Brand</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Deconstruction (Description)</label>
                <textarea 
                  required
                  rows={5}
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter product deconstruction details..."
                />
              </div>
            </div>

            <div className="d-flex gap-2 pt-3 border-top">
              <Link 
                href="/admin/products"
                className="btn btn-light border fw-bold text-uppercase px-4"
                style={{ fontSize: '12px', letterSpacing: '1px' }}
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={updating}
                className="btn btn-primary fw-bold text-uppercase px-4 flex-grow-1"
                style={{ fontSize: '12px', letterSpacing: '1px' }}
              >
                {updating ? 'Committing Synchronization...' : 'Commit Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
