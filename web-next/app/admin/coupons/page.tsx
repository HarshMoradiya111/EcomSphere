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

  if (loading) return <div className="p-10 font-bold text-[#64748b]">Synchronizing ledger...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8 pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Yield Protocols</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 font-black tracking-widest uppercase">Discount Matrix & Asset Incentives</p>
        </div>
        <Link href="/admin/coupons/add" className="btn-core btn-primary">
          <i className="fa-solid fa-plus"></i> Initialize Coupon
        </Link>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocol Code</th>
                <th>Yield Val</th>
                <th>Threshold</th>
                <th>Expiration</th>
                <th>Util Flow</th>
                <th>Status</th>
                <th className="text-right">Ops</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length > 0 ? coupons.map((coupon: any) => (
                <tr key={coupon._id}>
                  <td><strong className="text-[var(--accent)] tracking-widest font-black">{coupon.code}</strong></td>
                  <td className="font-bold text-white">
                    {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '₹'}
                  </td>
                  <td>₹{coupon.minPurchase}</td>
                  <td>
                    <span className={new Date(coupon.expiryDate) < new Date() ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-[12px] font-mono">{coupon.usedCount} / <span className="opacity-40">{coupon.usageLimit || '∞'}</span></td>
                  <td>
                    <span className="badge-pill">
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/coupons/edit/${coupon._id}`} className="w-8 h-8 flex items-center justify-center rounded border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                        <i className="fa-solid fa-pen-nib text-[12px]"></i>
                      </Link>
                      <button 
                        onClick={() => handleDelete(coupon._id)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-[var(--border)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition-all"
                      >
                        <i className="fa-solid fa-trash-can text-[12px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-40 text-center">
                    <i className="fa-solid fa-tag text-4xl text-[var(--surface-raised)] mb-4"></i>
                    <p className="text-[var(--text-muted)] uppercase tracking-[4px] text-[12px] font-black">No Yield Protocols Active</p>
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
