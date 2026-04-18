'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'Men Clothing',
    countInStock: 0,
    description: '',
    brand: 'EcomSphere',
    image: null as File | null
  });

  const categories = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics', 'Accessories'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('adminToken');
    
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price.toString());
      data.append('category', formData.category);
      data.append('countInStock', formData.countInStock.toString());
      data.append('description', formData.description);
      data.append('brand', formData.brand);
      if (formData.image) {
        data.append('image', formData.image);
      }

      const res = await fetch(`${API_URL}/api/v1/admin/products`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });
      
      const resData = await res.json();
      
      if (res.ok && resData.success) {
        router.push('/admin/products');
      } else {
        setError(resData.error || 'Identity conflict detected.');
      }
    } catch (err: any) {
      setError('Connection failure to central node.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Initialize New Asset</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Create a New Inventory Node</p>
        </div>
        <Link href="/admin/products" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
          <i className="fa-solid fa-arrow-left"></i> Back to Inventory
        </Link>
      </div>

      <div className="card shadow-sm border-0 mb-4" style={{ maxWidth: '900px' }}>
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
           <h3 className="fs-6 fw-bold text-dark text-uppercase tracking-widest mb-0">Asset Specifications</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4 fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
              </div>
            )}

            <div className="row g-4 mb-4">
              <div className="col-md-12">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Asset Identity (Name) <span className="text-danger">*</span></label>
                <input 
                  required
                  type="text" 
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Spectral Cotton T-Shirt"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Market Vertical <span className="text-danger">*</span></label>
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
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Spectral Brand</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Valuation (₹) <span className="text-danger">*</span></label>
                <input 
                  required
                  type="number" 
                  className="form-control font-monospace"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Cluster Capacity (Stock) <span className="text-danger">*</span></label>
                <input 
                  required
                  type="number" 
                  className="form-control font-monospace"
                  value={formData.countInStock}
                  onChange={(e) => setFormData({...formData, countInStock: parseInt(e.target.value)})}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Visual Asset (Image) <span className="text-danger">*</span></label>
                <input 
                  required={!formData.image}
                  type="file" 
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setFormData({...formData, image: e.target.files ? e.target.files[0] : null})}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Deconstruction (Description) <span className="text-danger">*</span></label>
                <textarea 
                  required
                  rows={5}
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed asset metadata..."
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
                disabled={loading}
                className="btn btn-primary fw-bold text-uppercase px-4 flex-grow-1"
                style={{ fontSize: '12px', letterSpacing: '1px' }}
              >
                {loading ? 'Initializing...' : 'Initialize Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
