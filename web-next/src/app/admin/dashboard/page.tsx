'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';

interface DashboardStats {
  productCount: number;
  userCount: number;
  orderCount: number;
  zeroStockCount: number;
  pipelineRevenue: number;
  topSellers: Array<{ name: string; totalQuantity: number; revenue: number }>;
  categorySales: Array<{ _id: string; totalSold: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container-fluid p-0">
      {/* 1. Global Metrics Strip */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className={`card shadow-sm border-0 h-100 ${loading ? 'placeholder-glow' : ''}`}>
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', fontSize: '24px' }}>
                <i className="fa-solid fa-box"></i>
              </div>
              <div className="w-100">
                {loading ? <span className="placeholder col-6 h3"></span> : <h3 className="mb-0 fw-bold">{stats?.productCount || 0}</h3>}
                <br />
                <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Inventory Items</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className={`card shadow-sm border-0 h-100 ${loading ? 'placeholder-glow' : ''}`}>
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #10b981, #047857)', fontSize: '24px' }}>
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="w-100">
                {loading ? <span className="placeholder col-6 h3"></span> : <h3 className="mb-0 fw-bold">{stats?.userCount || 0}</h3>}
                <br />
                <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Verified Nodes</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className={`card shadow-sm border-0 h-100 ${loading ? 'placeholder-glow' : ''}`}>
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontSize: '24px' }}>
                <i className="fa-solid fa-shopping-bag"></i>
              </div>
              <div className="w-100">
                {loading ? <span className="placeholder col-6 h3"></span> : <h3 className="mb-0 fw-bold">{stats?.orderCount || 0}</h3>}
                <br />
                <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Active Protocols</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className={`card shadow-sm border-0 h-100 ${loading ? 'placeholder-glow' : ''}`}>
            <div className="card-body d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3" style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #f43f5e, #be123c)', fontSize: '24px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div className="w-100">
                {loading ? <span className="placeholder col-6 h3"></span> : <h3 className="mb-0 fw-bold">{stats?.zeroStockCount || 0}</h3>}
                <br />
                <small className="text-muted text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Critical Low Stock</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Rapid Actions Cluster */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <a href="/admin/products/new" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-4">
          <i className="fa-solid fa-plus"></i> Deploy Product
        </a>
        <a href="/admin/marketing" className="btn btn-light border d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 text-dark">
          <i className="fa-solid fa-bullhorn text-secondary"></i> Pulse Dashboard
        </a>
        <a href="/admin/orders" className="btn btn-light border d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 text-dark">
          <i className="fa-solid fa-truck-fast text-secondary"></i> Ship Protocols
        </a>
      </div>

      {/* 3. Deep Analysis Reports */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className={`card shadow-sm border-0 h-100 ${loading ? 'placeholder-glow' : ''}`}>
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="text-uppercase fw-bold text-muted mb-0 d-flex align-items-center gap-2" style={{ letterSpacing: '2px', fontSize: '13px' }}>
                <i className="fa-solid fa-chart-line text-primary"></i> Financial Matrix
              </h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
              <div className="d-flex align-items-baseline mb-2">
                <span className="fs-3 fw-bold text-primary opacity-75 me-1">₹</span>
                {loading ? (
                  <span className="placeholder col-8 display-4"></span>
                ) : (
                  <>
                    <h2 className="display-4 fw-bold text-dark mb-0 leading-none">
                      {Number((stats?.pipelineRevenue || 0).toFixed(2).split('.')[0]).toLocaleString()}
                    </h2>
                    <span className="fs-4 fw-bold text-muted">.{((stats?.pipelineRevenue || 0).toFixed(2).split('.')[1]) || '00'}</span>
                  </>
                )}
              </div>
              <p className="text-primary fw-bold text-uppercase opacity-75 mb-4" style={{ fontSize: '11px', letterSpacing: '0.2em' }}>Total Pipeline Valuation</p>
              
              <div className="badge bg-light text-primary border border-primary border-opacity-25 rounded-pill px-4 py-2 d-flex align-items-center gap-2">
                <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '0.5rem', height: '0.5rem' }}></div>
                <span className="text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '10px' }}>Verified Matrix Sync</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className={`card shadow-sm border-0 h-100 ${loading ? 'placeholder-glow' : ''}`}>
            <div className="card-header bg-white border-bottom-0 pt-4 pb-3 d-flex align-items-center justify-content-between">
              <h5 className="text-uppercase fw-bold text-muted mb-0" style={{ letterSpacing: '2px', fontSize: '13px' }}>High Velocity Assets</h5>
              <a href="/admin/products" className="text-primary text-decoration-none text-uppercase fw-bold" style={{ fontSize: '11px', letterSpacing: '1px' }}>Monitor All</a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted" style={{ fontSize: '12px' }}>
                    <tr>
                      <th className="ps-4">Identity</th>
                      <th>Velocity</th>
                      <th className="pe-4 text-end">Valuation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i}>
                          <td className="ps-4"><span className="placeholder col-10"></span></td>
                          <td><span className="placeholder col-6"></span></td>
                          <td className="pe-4"><span className="placeholder col-4 float-end"></span></td>
                        </tr>
                      ))
                    ) : (stats?.topSellers || []).map((prod, idx) => (
                      <tr key={idx}>
                        <td className="ps-4 fw-semibold text-dark">{prod.name}</td>
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                            <span className="fw-bold me-1">{prod.totalQuantity}</span>
                            <span className="text-uppercase opacity-75" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Units Flowed</span>
                          </span>
                        </td>
                        <td className="pe-4 font-monospace text-end fw-bold">₹{prod.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                    {!loading && (!stats?.topSellers || stats.topSellers.length === 0) && (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted">No high velocity assets recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
