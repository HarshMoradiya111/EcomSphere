'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/src/config';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`${API_URL}/api/v1/admin/coupons`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons || []);
        }
      } catch (e) {
        console.error('Failed to fetch coupons');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const token = localStorage.getItem('adminToken');
    try {
        const res = await fetch(`${API_URL}/api/v1/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setCoupons(coupons.filter((c: any) => c._id !== id));
        }
    } catch (e) {}
  };

  if (loading) return <div className="p-4 text-muted d-flex align-items-center gap-3"><div className="spinner-border spinner-border-sm" role="status"></div>Synchronizing ledger...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fs-4 fw-bold text-dark text-uppercase tracking-tight mb-0">Yield Protocols</h2>
          <p className="text-muted small fw-bold tracking-widest text-uppercase mb-0 mt-1" style={{ letterSpacing: '0.1em' }}>Discount Matrix & Asset Incentives</p>
        </div>
        <Link href="/admin/coupons/add" className="btn btn-sm btn-primary d-flex align-items-center gap-2 shadow-sm">
          <i className="fa-solid fa-plus"></i> Initialize Coupon
        </Link>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-uppercase" style={{ fontSize: '12px' }}>
                <tr>
                  <th className="ps-4">Protocol Code</th>
                  <th>Yield Val</th>
                  <th>Threshold</th>
                  <th>Expiration</th>
                  <th>Util Flow</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Ops</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length > 0 ? coupons.map((coupon: any) => (
                  <tr key={coupon._id}>
                    <td className="ps-4"><strong className="text-primary tracking-widest fw-bold">{coupon.code}</strong></td>
                    <td className="fw-bold text-dark">
                      {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '₹'}
                    </td>
                    <td>₹{coupon.minPurchase}</td>
                    <td>
                      <span className={new Date(coupon.expiryDate) < new Date() ? 'text-danger fw-bold' : 'text-muted'}>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="small font-monospace text-muted">{coupon.usedCount} / <span className="opacity-50">{coupon.usageLimit || '∞'}</span></td>
                    <td>
                      <span className={`badge px-2 py-1 border ${coupon.isActive ? 'bg-success bg-opacity-10 text-success border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        <Link href={`/admin/coupons/edit/${coupon._id}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <i className="fa-solid fa-pen-nib"></i>
                        </Link>
                        <button 
                          onClick={() => handleDelete(coupon._id)}
                          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-5 text-center text-muted">
                      <i className="fa-solid fa-tag fs-2 mb-3 opacity-50"></i>
                      <p className="text-uppercase fw-bold mb-0" style={{ letterSpacing: '2px', fontSize: '12px' }}>No Yield Protocols Active</p>
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
