'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';

export default function CouponManagement() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 0,
    expiryDate: '',
    usageLimit: '',
    isActive: true
  });

  const fetchCoupons = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCoupons(data.coupons);
    } catch (err) {
      console.error('Coupon sync failed', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const payload = {
        ...form,
        usageLimit: form.usageLimit === '' ? null : parseInt(form.usageLimit),
        discountValue: parseFloat(form.discountValue.toString()),
        minPurchase: parseFloat(form.minPurchase.toString())
      };

      const res = await fetch(`${API_URL}/api/v1/admin/coupons`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setForm({
          code: '',
          discountType: 'percentage',
          discountValue: 10,
          minPurchase: 0,
          expiryDate: '',
          usageLimit: '',
          isActive: true
        });
        fetchCoupons();
      }
    } catch (err) {
      console.error('Creation failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    if (!confirm('Are you sure you want to deactivate this coupon?')) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error('Deletion failed', err);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Financial Core...</p>
      </div>
    </div>
  );

  return (
    <div className="p-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-2 uppercase tracking-widest text-[10px] font-black text-cyan-500">
           <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span> Revenue Calibration
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">Coupon <span className="text-cyan-400 not-italic">Engine</span></h1>
        <p className="text-slate-500 font-medium text-lg mt-2 uppercase tracking-widest text-xs">Manage discount matrix and promotional incentives</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Create Form */}
        <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl h-fit">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-slate-800/50 italic">Generate <span className="text-cyan-400 not-italic">Incentive</span></h2>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Discount Code</label>
                <input 
                  type="text" placeholder="WINTER50" required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all uppercase"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Type</label>
                   <select 
                     value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}
                     className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                   >
                     <option value="percentage">Percentage</option>
                     <option value="flat">Flat Amount</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Value</label>
                   <input 
                     type="number" required value={form.discountValue} onChange={e => setForm({...form, discountValue: parseFloat(e.target.value)})}
                     className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Min Purechase</label>
                   <input 
                     type="number" value={form.minPurchase} onChange={e => setForm({...form, minPurchase: parseFloat(e.target.value)})}
                     className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Usage Limit</label>
                   <input 
                     type="number" placeholder="Unlimited" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})}
                     className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                   />
                </div>
             </div>

             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Expiration Protocol (Date)</label>
                <input 
                  type="date" required value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-cyan-500 outline-none transition-all"
                />
             </div>

             <button type="submit" disabled={isSaving} className="w-full py-5 bg-cyan-500 text-slate-950 font-black rounded-3xl hover:bg-white transition-all uppercase tracking-widest text-[11px] shadow-xl shadow-cyan-500/20 disabled:bg-slate-800 disabled:text-slate-600">
               {isSaving ? 'INJECTING...' : 'Deploy Incentive Logic'}
             </button>
          </form>
        </section>

        {/* List Table */}
        <div className="lg:col-span-2">
           <section className="bg-slate-800/10 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-700/30 shadow-2xl overflow-hidden">
             <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800/50">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Active <span className="text-cyan-400 not-italic">Matrix</span></h2>
                <span className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-inner">{coupons.length} Active Protocols</span>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                         <th className="px-6 py-4">Protocol Identity</th>
                         <th className="px-6 py-4">Reduction Logic</th>
                         <th className="px-6 py-4">Constraints</th>
                         <th className="px-6 py-4">Expiration</th>
                         <th className="px-6 py-4 text-right pr-10">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/10">
                      {coupons.map((c, idx) => (
                        <tr key={idx} className="group hover:bg-cyan-500/[0.02] transition-colors">
                           <td className="px-6 py-8">
                              <span className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest italic">{c.code}</span>
                           </td>
                           <td className="px-6 py-8">
                               <p className="text-white font-black text-lg tracking-tighter mb-1">
                                 {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF
                               </p>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.discountType.toUpperCase()} MODE</span>
                           </td>
                           <td className="px-6 py-8">
                               <div className="space-y-1">
                                  <p className="text-slate-300 text-xs font-bold uppercase tracking-tight">Min: ₹{c.minPurchase}</p>
                                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">Used: {c.usedCount} / {c.usageLimit || '∞'}</p>
                               </div>
                           </td>
                           <td className="px-6 py-8">
                               <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${new Date(c.expiryDate) < new Date() ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                 {new Date(c.expiryDate).toLocaleDateString()}
                               </span>
                           </td>
                           <td className="px-6 py-8 text-right pr-6">
                              <button 
                                onClick={() => deleteCoupon(c._id)} 
                                className="bg-rose-500/10 text-rose-500 px-6 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-[0.2em]"
                              >
                                Deactivate
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </section>
        </div>
      </div>
    </div>
  );
}
