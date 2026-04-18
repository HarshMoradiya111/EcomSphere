'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config';
import { useAICatalogStore } from '@/store/aiCatalogStore';
import { getImageUrl } from '@/utils/imagePaths';

export default function AIReviewPage() {
  const router = useRouter();
  const { pendingProducts, categories, setPendingProducts, clear } = useAICatalogStore();
  const [products, setProducts] = useState(pendingProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if no products in store (e.g. refresh)
  useEffect(() => {
    if (pendingProducts.length === 0) {
      router.push('/admin/products/ai');
    } else {
      setProducts(pendingProducts);
    }
  }, [pendingProducts, router]);

  const handleUpdate = (index: number, field: string, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/products/save-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ products }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        clear();
        setTimeout(() => router.push('/admin/products'), 2000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4 bg-dark">
        <div className="rounded-circle bg-success d-flex align-items-center justify-content-center mb-4 shadow-lg" style={{ width: '100px', height: '100px' }}>
          <i className="fa-solid fa-check fs-1 text-white"></i>
        </div>
        <h1 className="display-4 fw-bold text-white italic uppercase tracking-tighter">Mission <span className="text-primary not-italic">Accomplished</span></h1>
        <p className="text-muted fw-bold uppercase tracking-widest small mt-3 italic">Neural intelligence integrated into core catalog</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <span className="text-primary fw-bold uppercase tracking-widest mb-1 d-block" style={{ fontSize: '10px' }}>Step 02: Neural Verification</span>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Review Synthesis</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>
            Auditing {products.length} Neural Spectral Identifications
          </p>
        </div>
        <button 
           onClick={() => { clear(); router.push('/admin/products/ai'); }}
           className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 shadow-sm"
        >
          <i className="fa-solid fa-trash-can"></i> Discard Batch
        </button>
      </div>

      <div className="d-grid gap-4 mb-5">
        {products.map((product, idx) => (
          <div 
            key={idx} 
            className="card shadow-sm border-0 rounded-4 overflow-hidden"
          >
            <div className="card-body p-4 p-lg-5">
              <div className="row g-4 g-lg-5">
                <div className="col-md-auto">
                  <div className="position-relative rounded-4 overflow-hidden shadow-sm border" style={{ width: '280px' }}>
                    <img 
                      src={getImageUrl(product.tempImage)} 
                      className="img-fluid object-fit-cover w-100" 
                      style={{ height: '280px' }}
                      alt="Product" 
                    />
                    <div className="position-absolute top-0 end-0 m-3 badge bg-primary text-white text-uppercase tracking-widest italic" style={{ fontSize: '9px' }}>Verified Asset</div>
                  </div>
                </div>

                <div className="col-md">
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Identity Label</label>
                      <input 
                        type="text" 
                        className="form-control form-control-lg fw-bold"
                        value={product.name}
                        onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Category Classification</label>
                      <select 
                        className="form-select fw-bold"
                        value={product.category}
                        onChange={(e) => handleUpdate(idx, 'category', e.target.value)}
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Valuation (INR)</label>
                      <input 
                        type="number" 
                        className="form-control fw-bold font-monospace"
                        value={product.price}
                        onChange={(e) => handleUpdate(idx, 'price', e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-muted small text-uppercase" style={{ letterSpacing: '1px' }}>Neural Synthesis (Description)</label>
                      <textarea 
                        className="form-control text-muted small"
                        rows={4}
                        value={product.description}
                        onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                        style={{ lineHeight: '1.6' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed-bottom p-4 d-flex justify-content-center z-3">
        <div className="card shadow-lg border-0 bg-dark text-white rounded-pill px-5 py-3 d-flex flex-row align-items-center gap-5">
           <div className="d-none d-md-block">
              <p className="fw-bold text-uppercase mb-0" style={{ fontSize: '13px', letterSpacing: '1px' }}>Final verification required.</p>
              <p className="text-muted small fw-bold text-uppercase mb-0" style={{ fontSize: '9px', letterSpacing: '2px' }}>Direct bridge to inventory cluster active</p>
           </div>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="btn btn-primary rounded-pill px-5 py-2 fw-bold text-uppercase shadow-sm"
             style={{ fontSize: '12px', letterSpacing: '2px' }}
           >
             {isSaving ? (
               <span className="d-flex align-items-center gap-2">
                 <span className="spinner-border spinner-border-sm" role="status"></span>
                 INTEGRATING...
               </span>
             ) : `Deploy ${products.length} Units`}
           </button>
        </div>
      </div>
    </div>
  );
}
