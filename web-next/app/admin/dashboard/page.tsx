'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/src/config';

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

  if (loading) return <div className="p-8 text-[#94a3b8]">Loading statistics...</div>;

  return (
    <div>
      {/* 1. Global Metrics Strip */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <i className="fa-solid fa-box"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[28px] font-[900] text-white tracking-tighter">{stats?.productCount || 0}</h3>
            <p className="text-[11px] font-[800] text-[#64748b] uppercase tracking-[1px] mt-1">Inventory Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[28px] font-[900] text-white tracking-tighter">{stats?.userCount || 0}</h3>
            <p className="text-[11px] font-[800] text-[#64748b] uppercase tracking-[1px] mt-1">Verified Nodes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <i className="fa-solid fa-shopping-bag"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[28px] font-[900] text-white tracking-tighter">{stats?.orderCount || 0}</h3>
            <p className="text-[11px] font-[800] text-[#64748b] uppercase tracking-[1px] mt-1">Active Protocols</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f43f5e, #be123c)' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[28px] font-[900] text-white tracking-tighter">{stats?.zeroStockCount || 0}</h3>
            <p className="text-[11px] font-[800] text-[#64748b] uppercase tracking-[1px] mt-1">Critical Low Stock</p>
          </div>
        </div>
      </div>

      {/* 2. Rapid Actions Cluster */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4">
        <a href="/admin/products/new" className="btn-core btn-primary">
          <i className="fa-solid fa-plus"></i> Deploy Product
        </a>
        <a href="/admin/marketing" className="btn-core btn-secondary">
          <i className="fa-solid fa-bullhorn"></i> Pulse Dashboard
        </a>
        <a href="/admin/orders" className="btn-core btn-secondary">
          <i className="fa-solid fa-truck-fast"></i> Ship Protocols
        </a>
      </div>

      {/* 3. Deep Analysis Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="admin-card">
          <div className="card-header">
            <h3 className="text-[14px] font-[800] text-white uppercase tracking-widest flex items-center gap-3">
              <i className="fa-solid fa-chart-line text-[var(--accent)]"></i> Financial Matrix
            </h3>
          </div>
          <div className="p-10 flex flex-col items-center justify-center min-vh-[260px]">
             <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-[var(--accent)] opacity-40">₹</span>
                <h2 className="text-[64px] font-[900] text-white tracking-tighter leading-none">
                  {Number((stats?.pipelineRevenue || 0).toFixed(2).split('.')[0]).toLocaleString()}
                </h2>
                <span className="text-xl font-bold text-[var(--text-muted)]">.{((stats?.pipelineRevenue || 0).toFixed(2).split('.')[1]) || '00'}</span>
             </div>
             <p className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.4em] mb-10 opacity-60">Total Pipeline Valuation</p>
             
            <div className="flex items-center gap-3 px-6 py-3 bg-[var(--accent-muted)] border border-[var(--accent)]/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent)]"></div>
              <p className="text-[10px] text-[var(--accent)] font-black uppercase tracking-[0.25em]">
                Verified Matrix Sync
              </p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-[14px] font-[800] text-white uppercase tracking-widest">High Velocity Assets</h3>
            <a href="/admin/products" className="text-[var(--accent)] text-[11px] font-[900] uppercase tracking-widest hover:underline">Monitor All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Velocity</th>
                  <th>Valuation</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.topSellers || []).map((prod, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-white">{prod.name}</td>
                    <td>
                      <span className="text-[var(--success)] font-bold">{prod.totalQuantity} <span className="text-[10px] opacity-50 uppercase tracking-tighter">Units Flowed</span></span>
                    </td>
                    <td className="font-mono text-[14px] font-bold">₹{prod.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
