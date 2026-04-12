'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    setLoading(true);
    setError(null);
    try {
      // Use absolute IPv4 URL to prevent DNS resolution issues (common on Windows)
      const res = await fetch('${API_URL}/api/v1/admin/stats');
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch statistics');
      }
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError('System could not connect to the Backend on Port 3000. Please ensure the Express server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-cyan-400 font-bold mt-8 animate-pulse tracking-widest uppercase text-xs">Synchronizing Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 p-12 rounded-[3rem] max-w-xl text-center backdrop-blur-2xl">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-black text-white mb-4">Network Connectivity Error</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={fetchStats}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-tighter"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest italic">Live Feed</span>
            <h1 className="text-5xl font-black tracking-tight text-white">System Intelligence</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg">Real-time performance analytics for EcomSphere v2.0</p>
        </div>
        <button 
            onClick={fetchStats}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 transition-all"
            title="Refresh Data"
        >
          🔄
        </button>
      </header>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Inventory" value={stats?.productCount ?? 0} color="from-blue-600 to-cyan-500" suffix="Items" />
        <StatCard title="Verified Users" value={stats?.userCount ?? 0} color="from-indigo-600 to-purple-500" suffix="Profiles" />
        <StatCard title="Active Orders" value={stats?.orderCount ?? 0} color="from-emerald-600 to-teal-500" suffix="Processed" />
        <StatCard title="Inventory Alerts" value={stats?.zeroStockCount ?? 0} color="from-rose-600 to-orange-500" suffix="Out of Stock" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Analysis */}
        <div className="xl:col-span-2 bg-slate-800/20 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-slate-700/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] -z-10 group-hover:bg-cyan-500/10 transition-all duration-1000"></div>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-cyan-500 rounded-full animate-pulse"></div>
             Financial Health Pipeline
          </h2>
          <div className="flex items-center gap-6">
             <span className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">₹{stats?.pipelineRevenue.toLocaleString() ?? '0'}</span>
             <div className="flex flex-col gap-1">
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black flex items-center gap-2">
                    <span className="text-xs">▲</span> +12.4%
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Daily Surge</span>
             </div>
          </div>
          <p className="text-slate-500 mt-10 font-medium text-lg leading-relaxed max-w-xl">
            This metric calculates revenue from all <span className="text-white font-bold">Shipped</span> and <span className="text-white font-bold">Delivered</span> inventory. Cancelled orders are automatically excluded from the logic.
          </p>
        </div>

        {/* Top Selling Velocity */}
        <div className="bg-slate-800/20 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-700/40 shadow-xl overflow-hidden relative">
          <h2 className="text-xl font-bold mb-10 tracking-tight flex justify-between items-center">
            Performance Leaders
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest animate-pulse">Velocity Map</span>
          </h2>
          <div className="space-y-8">
            {stats?.topSellers.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-cyan-400 text-lg shadow-inner group-hover:border-cyan-500 transition-all">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-200 group-hover:text-cyan-400 transition-colors uppercase tracking-widest text-[11px] mb-1">
                      {item.name.slice(0, 24)}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${100 - (idx * 15)}%` }}></div>
                        </div>
                        <p className="text-[9px] text-slate-500 font-black uppercase">{item.totalQuantity} SOLD</p>
                    </div>
                  </div>
                </div>
                <span className="font-black text-slate-100 text-sm italic">₹{item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="mt-8 bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-700/30 shadow-xl">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-black tracking-tight">Market Vertical Distribution</h2>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-1">Stock Diversification Index</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {stats?.categorySales.map((cat, idx) => (
              <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-900/30 hover:bg-slate-900/50 transition-all border border-slate-800/10 hover:border-cyan-500/20 text-center group">
                <p className="text-slate-500 text-[10px] font-black mb-3 uppercase tracking-[0.25em] group-hover:text-cyan-400 transition-colors">{cat._id || 'UNCLASSIFIED'}</p>
                <div className="text-4xl font-black text-white group-hover:scale-110 transition-transform">{cat.totalSold}</div>
                <span className="text-slate-700 text-[9px] font-black uppercase">Units Moved</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, suffix }: { title: string; value: number; color: string, suffix: string }) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-700/30 hover:border-cyan-500/50 transition-all group overflow-hidden relative shadow-lg">
      <div className={`absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br ${color} opacity-5 blur-[80px] group-hover:opacity-10 transition-opacity duration-1000`}></div>
      <p className="text-slate-500 font-black text-[12px] uppercase tracking-widest mb-6">{title}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-6xl font-black text-white tracking-tighter drop-shadow-xl">{value}</span>
        <span className="text-slate-600 font-black text-xs uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">{suffix}</span>
      </div>
    </div>
  );
}
