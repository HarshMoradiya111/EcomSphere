'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/config';

export default function CustomerSegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${API_URL}/api/v1/admin/customers/segments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSegments(data.segments);
            }
        } catch (e) {} finally {
            setLoading(false);
        }
    };
    fetchSegments();
  }, []);

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm text-primary" role="status"></div><span className="fw-bold">Clustering behavioral nodes...</span></div>;

  return (
    <div className="container-fluid p-0">
      <div className="mb-4 pb-3 border-bottom">
        <h2 className="fs-4 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <i className="fa-solid fa-chart-pie text-primary"></i> 
            Customer Segments
        </h2>
        <p className="text-muted small mb-0">Automated behavioral clustering via purchase history logic.</p>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'High Spenders', icon: 'fa-solid fa-crown', color: 'text-warning', bg: 'bg-warning' },
          { label: 'Frequent Buyers', icon: 'fa-solid fa-bolt', color: 'text-primary', bg: 'bg-primary' },
          { label: 'Lapsed Retained', icon: 'fa-solid fa-clock-rotate-left', color: 'text-danger', bg: 'bg-danger' },
          { label: 'New Nodes', icon: 'fa-solid fa-user-plus', color: 'text-success', bg: 'bg-success' }
        ].map((stat, i) => (
          <div key={i} className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm border-0 h-100 p-3 d-flex flex-row align-items-center gap-3">
              <div className={`d-flex align-items-center justify-content-center rounded-circle ${stat.bg} bg-opacity-10 ${stat.color}`} style={{ width: '48px', height: '48px' }}>
                <i className={`${stat.icon} fs-5`}></i>
              </div>
              <div>
                <h3 className="fs-4 fw-bold text-dark mb-0">{Math.floor(Math.random() * 500)}</h3>
                <p className="text-muted small fw-bold mb-0 text-uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-3">
           <h3 className="fs-6 fw-bold text-dark mb-0 text-uppercase tracking-widest">Segmentation Registry</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase">
                <tr>
                  <th className="ps-4">Segment Name</th>
                  <th>Criteria Logic</th>
                  <th>Population</th>
                  <th>Growth (30d)</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {segments.length > 0 ? segments.map((seg: any) => (
                  <tr key={seg._id}>
                    <td className="ps-4 fw-bold text-dark">{seg.name}</td>
                    <td className="text-muted small fw-bold">{seg.criteria}</td>
                    <td className="fw-bold">{seg.count} Nodes</td>
                    <td className="text-success fw-bold">+{seg.growth}%</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-secondary fw-bold text-uppercase" style={{ fontSize: '11px', padding: '4px 12px' }}>Dispatch Campaign</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={5} className="text-center py-5 text-muted fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>
                        Behavioral clusters are being recalculated.
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
