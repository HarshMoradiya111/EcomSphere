'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/src/config';

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
    <div className="admin-content" style={{ padding: '25px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Initialize New Asset</h2>
        <Link href="/admin/products" className="admin-btn btn-secondary">
          <i className="fa-solid fa-arrow-left"></i> Back to Inventory
        </Link>
      </div>

      <div className="admin-card" style={{ maxWidth: '800px' }}>
        <div className="card-header">
           <h3 style={{ fontSize: '16px' }}>Asset Specifications</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Asset Identity (Name) <span className="required">*</span></label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Spectral Cotton T-Shirt"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Market Vertical <span className="required">*</span></label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Spectral Brand</label>
              <input 
                type="text" 
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Valuation (₹) <span className="required">*</span></label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Cluster Capacity (Stock) <span className="required">*</span></label>
              <input 
                required
                type="number" 
                value={formData.countInStock}
                onChange={(e) => setFormData({...formData, countInStock: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Visual Asset (Image) <span className="required">*</span></label>
            <input 
              required={!formData.image}
              type="file" 
              accept="image/*"
              onChange={(e) => setFormData({...formData, image: e.target.files ? e.target.files[0] : null})}
            />
          </div>

          <div className="form-group">
            <label>Deconstruction (Description) <span className="required">*</span></label>
            <textarea 
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed asset metadata..."
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              type="submit"
              disabled={loading}
              className="admin-btn btn-primary"
              style={{ padding: '12px 40px' }}
            >
              {loading ? 'Initializing...' : 'Initialize Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
