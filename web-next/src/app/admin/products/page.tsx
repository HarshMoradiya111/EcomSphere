'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { API_URL } from '@/config';
import { getImageUrl } from '@/utils/imagePaths';

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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Initializing Inventory...</div>;

  return (
    <div className="container-fluid p-0">
      {/* 1. Universal Page Header */}
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Product Inventory</h2>
          <p className="text-muted small text-uppercase fw-bold mb-0" style={{ letterSpacing: '0.1em' }}>Global Asset Registry & Node Sync</p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/admin/products/ai" className="btn btn-sm text-white d-flex align-items-center gap-2 shadow-sm" style={{ background: '#6366f1' }}>
            <i className="fa-solid fa-brain"></i> Neural Assist
          </Link>
          <Link href="/admin/products/bulk" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
            <i className="fa-solid fa-file-import"></i> Bulk Ops
          </Link>
          <Link href="/admin/products/new" className="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm">
            <i className="fa-solid fa-plus"></i> New Asset
          </Link>
        </div>
      </div>

      {/* 2. Professional Control Strip */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-2 px-3 d-flex align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center flex-grow-1 gap-2">
            <i className="fa-solid fa-search text-muted"></i>
            <input 
              type="text" 
              placeholder="FILTER BY IDENTITY OR SKU..."
              className="form-control border-0 shadow-none text-uppercase fw-bold text-dark bg-transparent"
              style={{ fontSize: '13px', letterSpacing: '1px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="vr d-none d-md-block mx-2 text-muted"></div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '1px' }}>Sector</span>
            <select 
              className="form-select form-select-sm border-0 shadow-none fw-bold text-dark text-uppercase bg-transparent"
              style={{ fontSize: '13px', minWidth: '150px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Enterprise Data Grid */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4" style={{ width: '80px' }}>Asset</th>
                  <th>Identity</th>
                  <th>Sector</th>
                  <th>Valuation</th>
                  <th>Node Integrity</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map((p) => (
                  <tr key={p._id}>
                    <td className="ps-4 py-3">
                      <img src={getImageUrl(p.image)} alt="" className="img-thumbnail rounded" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>{p.name}</div>
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>ID://{p._id?.slice(-10) || 'ARCHIVED'}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1">{p.category}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark font-monospace">₹{p.price.toLocaleString()}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ maxWidth: '120px' }}>
                        <div className="progress flex-grow-1 bg-light" style={{ height: '6px' }}>
                          <div 
                            className={`progress-bar ${p.countInStock <= 5 ? 'bg-danger' : 'bg-success'}`} 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, (p.countInStock / 100) * 100)}%` }} 
                            aria-valuenow={p.countInStock} 
                            aria-valuemin={0} 
                            aria-valuemax={100}
                          ></div>
                        </div>
                        <span className={`fw-bold small ${p.countInStock <= 5 ? 'text-danger' : 'text-muted'}`}>{p.countInStock}</span>
                      </div>
                    </td>
                    <td className="pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <Link href={`/admin/products/edit/${p._id}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <i className="fa-solid fa-pen-nib"></i>
                        </Link>
                        <button onClick={() => deleteProduct(p._id)} className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-5 text-center text-muted">
                      <i className="fa-solid fa-satellite-dish fs-1 mb-3 opacity-50"></i>
                      <p className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '12px' }}>Zero Matching Nodes Identified</p>
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
