'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/src/config';

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

      <div className="card shadow-sm border-0 mb-4" style={{ maxWidth: '800px' }}>
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
           <h3 className="fs-6 fw-bold text-dark text-uppercase tracking-widest mb-0">CSV Payload Vector</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleUpload}>
            {error && (
              <div className="alert alert-danger border-0 shadow-sm mb-4 fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
              </div>
            )}
            
            <div className="p-5 text-center mb-4 rounded-4 border-2 border-dashed bg-light bg-opacity-50" style={{ borderColor: '#dee2e6' }}>
                <i className="fa-solid fa-file-csv display-1 text-primary opacity-25 mb-3"></i>
                <label className="d-block cursor-pointer">
                    <span className="d-block fs-5 fw-bold text-dark mb-2">{file ? file.name : 'Select CSV Payload'}</span>
                    <span className="btn btn-primary rounded-pill px-4 shadow-sm mb-2">
                        {file ? 'Change File' : 'Browse Files'}
                    </span>
                    <input 
                      required
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileChange} 
                      className="visually-hidden" 
                    />
                </label>
                <p className="text-muted small fw-bold text-uppercase mt-2 mb-0" style={{ letterSpacing: '1px', fontSize: '10px' }}>
                   Standard Catalog Schema Compliance Required
                </p>
            </div>

            <button 
              type="submit" 
              disabled={!file || uploading}
              className="btn btn-primary btn-lg w-100 fw-bold text-uppercase py-3 shadow-sm rounded-3"
              style={{ fontSize: '13px', letterSpacing: '2px' }}
            >
                {uploading ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Ingesting Payload...
                  </span>
                ) : 'Execute Mass Import'}
            </button>
          </form>

          <div className="mt-5 p-4 rounded-4 bg-dark text-white shadow-lg">
              <h4 className="fw-bold text-uppercase mb-3" style={{ fontSize: '11px', color: '#ffd700', letterSpacing: '2px' }}>
                <i className="fa-solid fa-shield-halved me-2"></i> Payload Constraints
              </h4>
              <div className="row g-3">
                  {[
                    'Name (Identity)', 'Price (Valuation)', 
                    'Category (Vertical)', 'Description (Specs)', 
                    'Image (Visual Link)', 'Stock (Capacity)'
                  ].map((item, idx) => (
                    <div key={idx} className="col-6">
                      <div className="d-flex align-items-center gap-2 small fw-bold text-uppercase opacity-75" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                        <i className="fa-solid fa-square-check text-success"></i> {item}
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
