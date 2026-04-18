'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/src/config';
import { useAICatalogStore } from '@/src/store/aiCatalogStore';

export default function AIUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPendingProducts = useAICatalogStore((state) => state.setPendingProducts);
  const setCategories = useAICatalogStore((state) => state.setCategories);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    generatePreviews(files);
  };

  const generatePreviews = (files: File[]) => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    Array.from(fileInputRef.current.files).forEach((file) => {
      formData.append('productImages', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/products/ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPendingProducts(data.products);
        setCategories(data.categories);
        router.push('/admin/products/ai/review');
      } else {
        setError(data.error || 'AI Analysis failed to ignite.');
      }
    } catch (err) {
      setError('Neural link synchronization failed. Check server status.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">AI Auto-Catalog</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Neural Spectral Synthesis</p>
        </div>
        <Link href="/admin/products" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
          <i className="fa-solid fa-arrow-left"></i> Back to Inventory
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleUpload}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 text-center mb-4 rounded-4 border-2 border-dashed bg-light bg-opacity-50 cursor-pointer transition-all hover:bg-opacity-100"
                  style={{ borderColor: '#dee2e6' }}
                >
                    <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                      <i className="fa-solid fa-wand-magic-sparkles fs-1 text-primary"></i>
                    </div>
                    <h3 className="fs-5 fw-bold text-dark text-uppercase tracking-tight mb-2">Initialize Vision Cluster</h3>
                    <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Drop up to 20 vision assets or click to browse</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple 
                      className="visually-hidden" 
                      accept="image/*"
                    />
                </div>

                {previews.length > 0 && (
                  <div className="row g-2 mb-4">
                    {previews.map((url, i) => (
                      <div key={i} className="col-3 col-md-2">
                        <div className="ratio ratio-1x1 rounded-3 overflow-hidden border shadow-sm">
                          <img src={url} className="object-fit-cover" alt="preview" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger border-0 shadow-sm mb-4 fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                    <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || previews.length === 0}
                  className="btn btn-primary btn-lg w-100 fw-bold text-uppercase py-3 shadow-sm rounded-3"
                  style={{ fontSize: '13px', letterSpacing: '2px' }}
                >
                  {isProcessing ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      CALCULATING NEURAL MATRIX...
                    </span>
                  ) : 'EXECUTE AI SYNTHESIS'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 bg-dark text-white mb-4 rounded-4">
            <div className="card-body p-4">
              <h4 className="fw-bold text-uppercase mb-4" style={{ fontSize: '12px', color: '#ffd700', letterSpacing: '2px' }}>Protocol Overview</h4>
              <div className="d-grid gap-4">
                {[
                  { step: '01', title: 'Spectral Recognition', desc: 'Gemini AI deconstructs textures, materials, and silhouettes.' },
                  { step: '02', title: 'Metadata Synthesis', desc: 'Automated synthesis of high-conversion marketing copy.' },
                  { step: '03', title: 'Cluster Deployment', desc: 'Verify and initialize directly to the global shop node.' }
                ].map((item, idx) => (
                  <div key={idx} className="d-flex gap-3">
                    <span className="fs-3 fw-bold text-primary opacity-50 italic">{item.step}</span>
                    <div>
                      <h6 className="fw-bold text-uppercase mb-1" style={{ fontSize: '12px', letterSpacing: '1px' }}>{item.title}</h6>
                      <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="card shadow-sm border-0 bg-primary bg-opacity-10 rounded-4">
            <div className="card-body p-4">
               <p className="text-primary fw-bold text-uppercase mb-2" style={{ fontSize: '11px', letterSpacing: '2px' }}>
                 <i className="fa-solid fa-cloud me-2"></i> Cloud-Native
               </p>
               <p className="text-dark small mb-0 fw-medium">
                 Assets are optimized through Cloudinary CDN with 99.9% uptime and global distribution.
               </p>
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="position-fixed top-0 start-0 w-100 h-100 z-3 bg-dark bg-opacity-75 backdrop-blur d-flex flex-column align-items-center justify-content-center text-center p-4">
          <div className="position-relative mb-4" style={{ width: '120px', height: '120px' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100 border border-4 border-white border-opacity-10 rounded-circle"></div>
            <div className="position-absolute top-0 start-0 w-100 h-100 border border-4 border-top-primary rounded-circle animate-spin"></div>
            <div className="position-absolute top-50 start-50 translate-middle">
              <i className="fa-solid fa-brain fs-1 text-primary animate-pulse"></i>
            </div>
          </div>
          <h2 className="display-6 fw-bold text-white tracking-tighter italic mb-2 uppercase">Neural <span className="text-primary not-italic">Synchronizing</span></h2>
          <p className="text-white opacity-50 fw-bold uppercase tracking-widest small animate-pulse">Mapping spectral data to catalog schemas...</p>
        </div>
      )}
    </div>
  );
}
