'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';

interface ImportRecord {
  _id: string;
  filename: string;
  count: number;
  status: string;
  createdAt: string;
}

export default function ImportHistory() {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/imports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setImports(data.imports);
    } catch (err) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteBatch = async (id: string, filename: string) => {
    if (!confirm(`DANGER: Are you sure you want to delete all products imported from "${filename}"?`)) return;
    
    setDeletingId(id);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/imports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setImports(imports.filter(i => i._id !== id));
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to delete batch');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Import Ledger</h2>
          <p className="text-muted small text-uppercase fw-bold mb-0" style={{ letterSpacing: '0.1em' }}>Historical Data Ingestion & Batch Control</p>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4">Timestamp</th>
                  <th>Source File</th>
                  <th>Payload Size</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="placeholder-glow">
                      <td className="ps-4"><div className="placeholder col-6"></div></td>
                      <td><div className="placeholder col-8"></div></td>
                      <td><div className="placeholder col-4"></div></td>
                      <td><div className="placeholder col-3"></div></td>
                      <td className="pe-4 text-end"><div className="placeholder col-4"></div></td>
                    </tr>
                  ))
                ) : imports.length > 0 ? imports.map((record) => (
                  <tr key={record._id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                        {new Date(record.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      <small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>
                        {new Date(record.createdAt).toLocaleTimeString('en-IN')}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-file-csv text-success"></i>
                        <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>{record.filename}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1 font-monospace">
                        {record.count} UNITS
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${record.status === 'Success' ? 'bg-success' : 'bg-danger'} text-uppercase`} style={{ fontSize: '10px' }}>
                        {record.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button 
                        onClick={() => deleteBatch(record._id, record.filename)}
                        disabled={deletingId === record._id}
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 ms-auto"
                      >
                        {deletingId === record._id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="fa-solid fa-rotate-left"></i>
                        )}
                        Delete Imported Products
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-5 text-center text-muted">
                      <i className="fa-solid fa-clock-rotate-left fs-1 mb-3 opacity-25"></i>
                      <p className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '12px' }}>No Import Cycles Recorded</p>
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
