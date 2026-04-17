'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/src/config';

interface Order {
  _id: string;
  user: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.warn('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch(`${API_URL}/api/v1/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="p-8 text-[#94a3b8]">Loading orders...</div>;

  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'processing': return 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6]';
      case 'shipped': return 'bg-[rgba(6,182,212,0.15)] text-[#06b6d4]';
      case 'delivered': return 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]';
      case 'cancelled': return 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]';
      default: return 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]'; // pending
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Order Management</h2>
        <button onClick={fetchOrders} className="btn-core btn-secondary">
          <i className="fa-solid fa-sync"></i> Refresh Registry
        </button>
      </div>

      <div className="admin-card">
        <div className="card-header">
           <p className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">Transaction Ledger</p>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Identity</th>
                <th>Status Protocol</th>
                <th>Valuation</th>
                <th>Deployed At</th>
                <th className="text-right">Ops</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="font-mono text-xs text-[var(--text-muted)] tracking-wider">
                    ORD-{o._id?.slice(-8).toUpperCase() || 'UNKNOWN'}
                  </td>
                  <td className="text-white font-medium">
                    {o.user ? `User://${o.user.slice(-6)}` : 'Guest Node'}
                  </td>
                  <td>
                    <select 
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="bg-[var(--surface-raised)] border border-[var(--border)] text-white text-[12px] font-bold rounded p-1 outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span className="font-bold text-white">₹{o.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="text-[12px] text-[var(--text-muted)]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <Link href={`/admin/orders/${o._id}`} className="btn-core btn-secondary !p-[4px_12px] !h-8 !text-[11px]">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
