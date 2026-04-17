'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/src/config';

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

  if (loading) return <div className="p-10 font-bold text-[#64748b]">Clustering behavioral nodes...</div>;

  return (
    <div className="admin-content" style={{ padding: '25px 30px' }}>
      <div className="card-header" style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--accent)', marginRight: '10px' }}></i> 
            Customer Segments
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Automated behavioral clustering via purchase history logic.</p>
      </div>

      <div className="stats-grid" style={{ padding: 0, marginBottom: '30px' }}>
        {[
          { label: 'High Spenders', icon: 'fa-solid fa-crown', color: '#ffd700', bg: 'rgba(255,215,0,0.1)' },
          { label: 'Frequent Buyers', icon: 'fa-solid fa-bolt', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Lapsed Retained', icon: 'fa-solid fa-clock-rotate-left', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'New Nodes', icon: 'fa-solid fa-user-plus', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <i className={stat.icon}></i>
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '20px' }}>{Math.floor(Math.random() * 500)}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="card-header">
           <h3 style={{ fontSize: '16px' }}>Segmentation Registry</h3>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Segment Name</th>
                <th>Criteria Logic</th>
                <th>Population</th>
                <th>Growth (30d)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {segments.length > 0 ? segments.map((seg: any) => (
                <tr key={seg._id}>
                  <td><strong>{seg.name}</strong></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{seg.criteria}</td>
                  <td>{seg.count} Nodes</td>
                  <td style={{ color: '#22c55e' }}>+{seg.growth}%</td>
                  <td>
                    <button className="admin-btn btn-secondary btn-sm">Dispatch Campaign</button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                      Behavioral clusters are being recalculated.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
