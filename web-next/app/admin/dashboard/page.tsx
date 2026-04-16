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
    <div className="admin-content">
      {/* Stats Grid - Exactly like legacy stats-grid */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px] p-[25px_30px]">
        
        <div className="stat-card bg-[#1e293b] border border-[#334155] rounded-[12px] p-[20px] flex items-center gap-[16px] transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
          <div className="stat-icon w-[52px] h-[52px] rounded-[12px] flex items-center justify-center text-[22px] text-white shrink-0 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]">
            <i className="fa-solid fa-box"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[26px] font-[800] text-[#f1f5f9]">{stats?.productCount || 0}</h3>
            <p className="text-[13px] text-[#94a3b8] mt-[2px]">Total Products</p>
          </div>
        </div>

        <div className="stat-card bg-[#1e293b] border border-[#334155] rounded-[12px] p-[20px] flex items-center gap-[16px] transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
          <div className="stat-icon w-[52px] h-[52px] rounded-[12px] flex items-center justify-center text-[22px] text-white shrink-0 bg-gradient-to-br from-[#22c55e] to-[#15803d]">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[26px] font-[800] text-[#f1f5f9]">{stats?.userCount || 0}</h3>
            <p className="text-[13px] text-[#94a3b8] mt-[2px]">Total Users</p>
          </div>
        </div>

        <div className="stat-card bg-[#1e293b] border border-[#334155] rounded-[12px] p-[20px] flex items-center gap-[16px] transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
          <div className="stat-icon w-[52px] h-[52px] rounded-[12px] flex items-center justify-center text-[22px] text-white shrink-0 bg-gradient-to-br from-[#f59e0b] to-[#b45309]">
            <i className="fa-solid fa-shopping-bag"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[26px] font-[800] text-[#f1f5f9]">{stats?.orderCount || 0}</h3>
            <p className="text-[13px] text-[#94a3b8] mt-[2px]">Total Orders</p>
          </div>
        </div>

        <div className="stat-card bg-[#1e293b] border border-[#334155] rounded-[12px] p-[20px] flex items-center gap-[16px] transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]">
          <div className="stat-icon w-[52px] h-[52px] rounded-[12px] flex items-center justify-center text-[22px] text-white shrink-0 bg-gradient-to-br from-[#ef4444] to-[#b91c1c]">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="stat-info">
            <h3 className="text-[26px] font-[800] text-[#f1f5f9]">{stats?.zeroStockCount || 0}</h3>
            <p className="text-[13px] text-[#94a3b8] mt-[2px]">Out of Stock</p>
          </div>
        </div>

      </div>

      <div className="quick-actions flex gap-[12px] p-[0_30px_20px] flex-wrap">
        <a href="/admin/products/add" className="admin-btn bg-[#ffd700] text-[#0f172a] inline-flex items-center gap-[6px] p-[9px_16px] rounded-[7px] text-[13px] font-[600] active:scale-95 transition-all">
          <i className="fa-solid fa-plus"></i> Add Product
        </a>
        <a href="/admin/marketing" className="admin-btn bg-[#334155] text-[#f1f5f9] inline-flex items-center gap-[6px] p-[9px_16px] rounded-[7px] text-[13px] font-[600] border border-[#334155] hover:bg-[#334155]/80 active:scale-95 transition-all">
          <i className="fa-solid fa-bullhorn"></i> Marketing
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] px-[30px] mb-8">
        {/* Revenue Card */}
        <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[12px] overflow-hidden">
          <div className="card-header flex items-center justify-between p-[18px_22px] border-b border-[#334155]">
            <h3 className="text-[16px] font-[700] text-[#f1f5f9]">Revenue Overview</h3>
          </div>
          <div className="p-8 flex flex-col items-center">
            <h4 className="text-[#94a3b8] uppercase text-[12px] font-[800] tracking-widest mb-2">Total Revenue</h4>
            <span className="text-5xl font-black text-[#f1f5f9]">₹{stats?.pipelineRevenue.toLocaleString() || '0'}</span>
            <p className="text-[12px] text-[#94a3b8] mt-4 max-w-sm text-center">
              Lifetime sales data synchronized across all fulfillment nodes.
            </p>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[12px] overflow-hidden">
          <div className="card-header flex items-center justify-between p-[18px_22px] border-b border-[#334155]">
            <h3 className="text-[16px] font-[700] text-[#f1f5f9]">Top Selling Products</h3>
            <a href="/admin/products" className="text-[#ffd700] text-[13px] font-[600]">See All</a>
          </div>
          <div className="table-responsive w-full overflow-x-auto">
            <table className="admin-table w-full border-collapse">
              <thead>
                <tr className="bg-[#0f172a]">
                  <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Product Name</th>
                  <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Sales</th>
                  <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topSellers.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-white/2 border-b border-[#334155]">
                    <td className="p-[14px_16px] text-[14px] text-[#f1f5f9]">{prod.name}</td>
                    <td className="p-[14px_16px] text-[14px] font-[700] text-[#22c55e]">{prod.totalQuantity} Units</td>
                    <td className="p-[14px_16px] text-[14px] text-[#f1f5f9]">₹{prod.revenue.toLocaleString()}</td>
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
