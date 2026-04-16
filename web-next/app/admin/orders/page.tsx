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
    <div className="admin-content">
      <div className="admin-card bg-[#1e293b] border border-[#334155] rounded-[12px] m-[25px_30px] overflow-hidden">
        <div className="card-header flex items-center justify-between p-[18px_22px] border-b border-[#334155]">
          <h3 className="text-[16px] font-[700] text-[#f1f5f9]">All Orders</h3>
          <button onClick={fetchOrders} className="text-[#ffd700] text-[13px] font-[600]">
            <i className="fa-solid fa-sync"></i> Refresh
          </button>
        </div>
        <div className="table-responsive w-full overflow-x-auto">
          <table className="admin-table w-full border-collapse">
            <thead>
              <tr className="bg-[#0f172a]">
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Order ID</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Total</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Status</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Date</th>
                <th className="text-[#ffd700] p-[14px_16px] text-left font-[600] text-[12px] uppercase tracking-[0.5px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-white/2 border-b border-[#334155]">
                  <td className="p-[14px_16px] text-[13px] text-[#94a3b8] font-mono">{o._id}</td>
                  <td className="p-[14px_16px] text-[14px] text-[#f1f5f9] font-[700]">₹{o.totalAmount.toLocaleString()}</td>
                  <td className="p-[14px_16px]">
                    <select 
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className={`p-[4px_10px] rounded-[20px] text-[12px] font-[700] bg-[#0f172a] border border-[#334155] outline-none ${getStatusBadgeClass(o.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-[14px_16px] text-[13px] text-[#94a3b8]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-[14px_16px]">
                    <Link href={`/admin/orders/${o._id}`} className="p-[6px_12px] bg-[#334155] text-white rounded-[6px] text-[12px] hover:bg-[#475569] font-[600]">
                      Details
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
