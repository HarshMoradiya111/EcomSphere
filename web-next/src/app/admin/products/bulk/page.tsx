'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config';

export default function BulkUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/products/bulk`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert(`Successfully imported ${data.count} units.`);
        router.push('/admin/products');
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError('Connection failure to central node.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Mass Ingestion Protocol</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Bulk Catalog Synchronization</p>
        </div>
        <Link href="/admin/products" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
          <i className="fa-solid fa-arrow-left"></i> Back to Inventory
        </Link>
      </div>

      <div className="card shadow-sm border-0 mb-4" style={{ maxWidth: '800px', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
           <h3 className="fs-6 fw-bold text-primary text-uppercase tracking-widest mb-0" style={{ fontSize: '12px' }}>CSV Payload Vector</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleUpload}>
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4 fw-bold text-uppercase d-flex align-items-center gap-2" style={{ fontSize: '11px', letterSpacing: '1px', borderRadius: '12px' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}
            
            <div className="p-5 text-center mb-4 rounded-4 border-2 border-dashed bg-light bg-opacity-75" style={{ borderColor: '#cbd5e1', borderStyle: 'dashed' }}>
                <div className="mb-3">
                  <i className="fa-solid fa-cloud-arrow-up display-3 text-primary opacity-50"></i>
                </div>
                <label className="d-block cursor-pointer">
                    <span className="d-block fs-5 fw-bold text-dark mb-2">{file ? file.name : 'Drop CSV Payload Here'}</span>
                    <span className="text-muted small d-block mb-3">Only standard catalog schemas are accepted</span>
                    <span className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                        {file ? 'Change Vector' : 'Select Source'}
                    </span>
                    <input 
                      required
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileChange} 
                      className="visually-hidden" 
                    />
                </label>
            </div>

            <button 
              type="submit" 
              disabled={!file || uploading}
              className="btn btn-primary btn-lg w-100 fw-bold text-uppercase py-3 shadow-sm rounded-4 border-0"
              style={{ 
                fontSize: '13px', 
                letterSpacing: '2px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}
            >
                {uploading ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Executing Transmission...
                  </span>
                ) : (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <i className="fa-solid fa-bolt"></i> Execute Mass Import
                  </span>
                )}
            </button>
          </form>

          <div className="mt-5 p-4 rounded-4 bg-dark text-white shadow-lg border-0">
              <h4 className="fw-bold text-uppercase mb-3 d-flex align-items-center gap-2" style={{ fontSize: '11px', color: '#60a5fa', letterSpacing: '2px' }}>
                <i className="fa-solid fa-shield-halved"></i> Schema Constraints
              </h4>
              <div className="row g-3">
                  {[
                    'Name (Identity)', 'Price (Valuation)', 
                    'Category (Vertical)', 'Description (Specs)', 
                    'Image (Visual URL)', 'Stock (Inventory Level)'
                  ].map((item, idx) => (
                    <div key={idx} className="col-12 col-md-6">
                      <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px', color: '#cbd5e1' }}>
                        <i className="fa-solid fa-check-double text-success"></i> {item}
                      </div>
                    </div>
                  ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
