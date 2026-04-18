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

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Loading orders...</div>;

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
      case 'shipped': return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
      case 'delivered': return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
      case 'cancelled': return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
      default: return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'; // pending
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Order Management</h2>
        <button onClick={fetchOrders} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
          <i className="fa-solid fa-sync"></i> Refresh Registry
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-3">
          <p className="text-muted small text-uppercase fw-bold mb-0" style={{ letterSpacing: '0.2em' }}>Transaction Ledger</p>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4">Order ID</th>
                  <th>Identity</th>
                  <th>Status Protocol</th>
                  <th>Valuation</th>
                  <th>Deployed At</th>
                  <th className="text-end pe-4">Ops</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="ps-4 font-monospace text-muted small tracking-wider">
                      ORD-{o._id?.slice(-8).toUpperCase() || 'UNKNOWN'}
                    </td>
                    <td className="text-dark fw-bold">
                      {o.user ? `User://${o.user.slice(-6)}` : 'Guest Node'}
                    </td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className={`form-select form-select-sm fw-bold shadow-none ${getStatusBadgeClass(o.status)}`}
                        style={{ fontSize: '12px', minWidth: '120px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <span className="fw-bold text-dark font-monospace">₹{o.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="text-muted small">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end pe-4">
                      <Link href={`/admin/orders/${o._id}`} className="btn btn-sm btn-outline-secondary px-3 py-1" style={{ fontSize: '11px' }}>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No transaction records found.
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
