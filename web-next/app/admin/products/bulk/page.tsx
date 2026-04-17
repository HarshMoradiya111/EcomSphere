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
    <div className="admin-content" style={{ padding: '25px 30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Mass Ingestion Protocol</h2>
        <Link href="/admin/products" className="admin-btn btn-secondary">
          <i className="fa-solid fa-arrow-left"></i> Back
        </Link>
      </div>

      <div className="admin-card" style={{ maxWidth: '800px' }}>
        <div className="card-header">
           <h3 style={{ fontSize: '16px' }}>CSV Payload Vector</h3>
        </div>

        <div style={{ padding: '30px' }}>
          <form onSubmit={handleUpload} className="admin-form">
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="form-group" style={{ textAlign: 'center', padding: '40px', border: '2px dashed var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                <i className="fa-solid fa-file-csv" style={{ fontSize: '48px', color: 'var(--accent)', marginBottom: '15px' }}></i>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{file ? file.name : 'Choose CSV File'}</span>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                    />
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>Ensure standard catalog schema compliance.</p>
            </div>

            <div style={{ marginTop: '30px' }}>
                <button 
                  type="submit" 
                  disabled={!file || uploading}
                  className="admin-btn btn-primary"
                  style={{ width: '100%', padding: '15px' }}
                >
                    {uploading ? 'INGESTING PAYLOAD...' : 'Execute Mass Import'}
                </button>
            </div>
          </form>

          <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '15px' }}>Payload Constraints</h4>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <li><i className="fa-solid fa-check" style={{ color: 'var(--accent)', marginRight: '8px' }}></i> Name (Required)</li>
                  <li><i className="fa-solid fa-check" style={{ color: 'var(--accent)', marginRight: '8px' }}></i> Price (Required)</li>
                  <li><i className="fa-solid fa-check" style={{ color: 'var(--accent)', marginRight: '8px' }}></i> Category</li>
                  <li><i className="fa-solid fa-check" style={{ color: 'var(--accent)', marginRight: '8px' }}></i> Description</li>
                  <li><i className="fa-solid fa-check" style={{ color: 'var(--accent)', marginRight: '8px' }}></i> Image Link</li>
                  <li><i className="fa-solid fa-check" style={{ color: 'var(--accent)', marginRight: '8px' }}></i> Stock Value</li>
              </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
